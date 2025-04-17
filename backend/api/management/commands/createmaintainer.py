from django.core.management.base import BaseCommand
from api.models import User
import getpass

class Command(BaseCommand):
    help = 'Creates a maintainer user'

    def add_arguments(self, parser):
        parser.add_argument('id_no', type=str, help='ID number for the new maintainer')
        parser.add_argument('--name', type=str, help='Name for the new maintainer')
        parser.add_argument('--email', type=str, help='Email for the new maintainer')
        parser.add_argument('--password', type=str, help='Password for the new maintainer')

    def handle(self, *args, **options):
        id_no = options['id_no']
        
        # Check if user already exists
        if User.objects.filter(id_no=id_no).exists():
            self.stdout.write(self.style.ERROR(f'User with ID {id_no} already exists'))
            return
            
        name = options['name']
        if not name:
            name = input("Name: ")
            
        email = options['email']
        if not email:
            email = input("Email: ")
            
        password = options['password']
        if not password:
            password = getpass.getpass("Password: ")
            password2 = getpass.getpass("Password (again): ")
            if password != password2:
                self.stdout.write(self.style.ERROR('Passwords do not match'))
                return
        
        # Create the maintainer user
        user = User.objects.create_user(
            id_no=id_no,
            name=name,
            email=email,
            password=password,
            user_type='maintainer'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Maintainer {id_no} created successfully'))