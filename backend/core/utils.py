import os
from django.utils.text import slugify
from django.core.files.storage import default_storage
from django.conf import settings
import uuid

def generate_unique_slug(model_instance, slugable_field_name, slug_field_name):
    """
    Generate a unique slug based on a field value.
    """
    slug = slugify(getattr(model_instance, slugable_field_name))
    unique_slug = slug
    extension = 1

    model_class = model_instance.__class__
    while model_class._default_manager.filter(**{slug_field_name: unique_slug}).exists():
        unique_slug = f'{slug}-{extension}'
        extension += 1
    
    return unique_slug

def handle_uploaded_file(file, directory='uploads'):
    """
    Handle file upload with unique filename.
    Returns the file path relative to MEDIA_ROOT.
    """
    if not file:
        return None

    filename = file.name
    ext = os.path.splitext(filename)[1]
    unique_filename = f'{uuid.uuid4().hex}{ext}'
    
    # Create the directory if it doesn't exist
    full_path = os.path.join(settings.MEDIA_ROOT, directory)
    if not os.path.exists(full_path):
        os.makedirs(full_path)
    
    # Save the file
    file_path = os.path.join(directory, unique_filename)
    with default_storage.open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    return file_path

def calculate_file_size_mb(file):
    """
    Calculate file size in megabytes.
    """
    if not file:
        return 0
    return file.size / (1024 * 1024)  # Convert bytes to MB

def get_client_ip(request):
    """
    Get client IP address from request.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip 