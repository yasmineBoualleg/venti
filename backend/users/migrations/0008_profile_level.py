# Generated by Django 5.1.3 on 2025-07-03 22:49

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_alter_profile_xp'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='level',
            field=models.IntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)]),
        ),
    ]
