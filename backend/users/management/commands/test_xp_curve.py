from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.xp_system import calculate_level, get_xp_for_next_level, get_total_xp_for_level

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the XP curve system with real user data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Test with a specific user email'
        )
        parser.add_argument(
            '--demo',
            action='store_true',
            help='Show demo progression without affecting users'
        )

    def handle(self, *args, **options):
        if options['demo']:
            self.show_demo()
        elif options['user_email']:
            self.test_user(options['user_email'])
        else:
            self.show_all_users()

    def show_demo(self):
        """Show demo progression without affecting users."""
        self.stdout.write(
            self.style.SUCCESS('🎮 Venti XP System - Game-like Curve Demo')
        )
        self.stdout.write('=' * 50)
        self.stdout.write('')
        
        self.stdout.write('📊 Level Progression:')
        self.stdout.write('-' * 30)
        
        # Show first 10 levels
        for level in range(1, 11):
            xp_needed = get_xp_for_next_level(level)
            total_xp = get_total_xp_for_level(level + 1)
            self.stdout.write(f"Level {level}: {xp_needed} XP needed (Total: {total_xp} XP)")
        
        self.stdout.write('')
        self.stdout.write('🎯 Example XP Values:')
        self.stdout.write('-' * 25)
        
        # Test some XP values
        test_xp_values = [50, 100, 250, 500, 1000, 2000, 5000]
        
        for xp in test_xp_values:
            level = calculate_level(xp)
            next_level_xp = get_xp_for_next_level(level)
            total_for_next = get_total_xp_for_level(level + 1)
            xp_remaining = total_for_next - xp
            
            self.stdout.write(f"{xp} XP → Level {level} (Need {xp_remaining} more for Level {level + 1})")
        
        self.stdout.write('')
        self.stdout.write('💡 Key Features:')
        self.stdout.write('-' * 15)
        self.stdout.write('• Level 1: 100 XP needed')
        self.stdout.write('• Level 2: 200 XP needed (300 total)')
        self.stdout.write('• Level 3: 300 XP needed (600 total)')
        self.stdout.write('• Level 4: 400 XP needed (1000 total)')
        self.stdout.write('• Level 5: 500 XP needed (1500 total)')
        self.stdout.write('• Each level requires progressively more XP!')
        self.stdout.write('')
        self.stdout.write('🎉 This creates a satisfying progression curve that gets harder as you advance!')

    def test_user(self, email):
        """Test XP curve with a specific user."""
        try:
            user = User.objects.get(email=email)
            profile = user.profile
            
            self.stdout.write(
                self.style.SUCCESS(f'🎯 Testing XP curve for user: {email}')
            )
            self.stdout.write('=' * 50)
            self.stdout.write('')
            
            self.stdout.write(f'Current XP: {profile.xp}')
            self.stdout.write(f'Current Level: {profile.level}')
            
            # Calculate what the level should be
            calculated_level = calculate_level(profile.xp)
            self.stdout.write(f'Calculated Level: {calculated_level}')
            
            if profile.level != calculated_level:
                self.stdout.write(
                    self.style.WARNING('⚠️  Level mismatch! Profile level should be updated.')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('✅ Level calculation is correct!')
                )
            
            # Show progress to next level
            next_level_xp = get_xp_for_next_level(profile.level)
            total_for_next = get_total_xp_for_level(profile.level + 1)
            xp_remaining = total_for_next - profile.xp
            
            self.stdout.write('')
            self.stdout.write('📈 Progress to Next Level:')
            self.stdout.write(f'XP needed for Level {profile.level + 1}: {xp_remaining}')
            self.stdout.write(f'Progress: {profile.xp}/{total_for_next} XP')
            
            # Calculate progress percentage
            progress_percent = (profile.xp / total_for_next) * 100 if total_for_next > 0 else 0
            self.stdout.write(f'Progress: {progress_percent:.1f}%')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User with email {email} not found!')
            )

    def show_all_users(self):
        """Show XP stats for all users."""
        users = User.objects.filter(profile__isnull=False)
        
        self.stdout.write(
            self.style.SUCCESS(f'👥 XP Stats for {users.count()} Users')
        )
        self.stdout.write('=' * 50)
        self.stdout.write('')
        
        for user in users:
            profile = user.profile
            calculated_level = calculate_level(profile.xp)
            
            self.stdout.write(f'{user.email}:')
            self.stdout.write(f'  XP: {profile.xp} | Level: {profile.level} | Calculated: {calculated_level}')
            
            if profile.level != calculated_level:
                self.stdout.write(
                    self.style.WARNING('  ⚠️  Level needs update!')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('  ✅ Level is correct')
                )
            self.stdout.write('') 