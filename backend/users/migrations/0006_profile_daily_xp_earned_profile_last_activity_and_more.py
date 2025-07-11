# Generated by Django 5.1.3 on 2025-07-03 22:28

import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_set_last_daily_reset_default'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='daily_xp_earned',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)]),
        ),
        migrations.AddField(
            model_name='profile',
            name='last_activity',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='last_daily_reset',
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.CreateModel(
            name='UserActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_start', models.DateTimeField(auto_now_add=True)),
                ('session_end', models.DateTimeField(blank=True, null=True)),
                ('duration_minutes', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User Activity',
                'verbose_name_plural': 'User Activities',
                'ordering': ['-session_start'],
            },
        ),
        migrations.CreateModel(
            name='XPLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('reason', models.CharField(choices=[('signup', 'New User Signup'), ('profile_edit', 'Profile Edit'), ('daily_activity', 'Daily Activity (30+ min)'), ('session_activity', 'Session Activity (30+ min)'), ('collaboration', 'Collaboration'), ('feature_use', 'New Feature Usage'), ('admin_grant', 'Admin Grant'), ('comment', 'Comment Posted'), ('login_streak', 'Login Streak'), ('skill_added', 'Skill Added'), ('badge_earned', 'Badge Earned')], max_length=50)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='xp_logs', to='users.profile')),
            ],
            options={
                'verbose_name': 'XP Log',
                'verbose_name_plural': 'XP Logs',
                'ordering': ['-created_at'],
            },
        ),
    ]
