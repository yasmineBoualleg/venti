from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Profile

User = get_user_model()

class Command(BaseCommand):
    help = 'Add XP to all users for new features or special events'

    def add_arguments(self, parser):
        parser.add_argument(
            'amount',
            type=int,
            help='Amount of XP to add to each user'
        )
        parser.add_argument(
            '--reason',
            type=str,
            default='feature_use',
            help='Reason for XP gain (default: feature_use)'
        )
        parser.add_argument(
            '--description',
            type=str,
            default='New feature reward',
            help='Description of the XP gain'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually doing it'
        )

    def handle(self, *args, **options):
        amount = options['amount']
        reason = options['reason']
        description = options['description']
        dry_run = options['dry_run']

        if amount <= 0:
            self.stdout.write(
                self.style.ERROR('Amount must be positive')
            )
            return

        # Get all users with profiles
        profiles = Profile.objects.all()
        total_users = profiles.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would add {amount} XP to {total_users} users'
                )
            )
            self.stdout.write(f'Reason: {reason}')
            self.stdout.write(f'Description: {description}')
            return

        # Add XP to all users
        success_count = 0
        failed_count = 0

        for profile in profiles:
            try:
                success = profile.add_xp(amount, reason, description)
                if success:
                    success_count += 1
                    self.stdout.write(
                        f'Added {amount} XP to {profile.user.email}'
                    )
                else:
                    failed_count += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f'Failed to add XP to {profile.user.email} (daily limit reached)'
                        )
                    )
            except Exception as e:
                failed_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'Error adding XP to {profile.user.email}: {str(e)}'
                    )
                )

        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nXP distribution completed!'
            )
        )
        self.stdout.write(f'Successfully added XP to: {success_count} users')
        if failed_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'Failed to add XP to: {failed_count} users'
                )
            )
        
        total_xp_added = success_count * amount
        self.stdout.write(f'Total XP distributed: {total_xp_added}') 