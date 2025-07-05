from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Profile, CollabRequest, PastCollaboration

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a profile for new users."""
    if created:
        profile = Profile.objects.create(user=instance)
        # Profile already starts with 10 XP by default, so no need to add extra

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the user profile."""
    if hasattr(instance, 'profile'):
        instance.profile.save()

@receiver(post_save, sender=CollabRequest)
def handle_collab_request_status_change(sender, instance, **kwargs):
    """Handle collaboration request status changes."""
    if instance.status == 'accepted':
        # The accept() method already handles XP and PastCollaboration creation
        pass
    elif instance.status == 'declined':
        # Handle declined requests if needed
        pass

@receiver(post_delete, sender=User)
def delete_user_profile(sender, instance, **kwargs):
    """Delete user profile when user is deleted."""
    if hasattr(instance, 'profile'):
        instance.profile.delete() 