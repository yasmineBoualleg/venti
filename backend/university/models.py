from django.db import models

# Create your models here.

class University(models.Model):
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='university_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'universities'
        ordering = ['name']

    def __str__(self):
        return self.name
