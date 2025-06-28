from django.db import models
from django.conf import settings

# Create your models here.

class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    created_at and updated_at fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class UserStampedModel(TimeStampedModel):
    """
    An abstract base class model that provides self-updating
    created_at and updated_at fields, plus created_by and updated_by fields.
    """
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_created',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_updated',
    )

    class Meta:
        abstract = True
