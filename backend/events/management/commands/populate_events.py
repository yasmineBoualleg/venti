from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from events.models import Event, EventParticipant
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with sample event data'

    def handle(self, *args, **kwargs):
        # Create test users if they don't exist
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            email='admin@example.com',
            defaults={'is_staff': True, 'is_superuser': True}
        )
        admin_user.set_password('admin123')
        admin_user.save()

        user1, _ = User.objects.get_or_create(
            username='john_doe',
            email='john@example.com'
        )
        user1.set_password('user123')
        user1.save()

        user2, _ = User.objects.get_or_create(
            username='jane_smith',
            email='jane@example.com'
        )
        user2.set_password('user123')
        user2.save()

        # Create events
        now = timezone.now()
        events_data = [
            {
                'title': 'Python Workshop',
                'description': 'Learn Python programming basics',
                'organizer': admin_user,
                'start_date': now + timedelta(days=7),
                'end_date': now + timedelta(days=7, hours=2),
                'registration_deadline': now + timedelta(days=6),
                'location': 'Room 101',
                'is_online': False,
                'max_participants': 20,
                'status': 'PUBLISHED',
                'visibility': 'PUBLIC'
            },
            {
                'title': 'Virtual Art Exhibition',
                'description': 'Showcase your digital art',
                'organizer': user1,
                'start_date': now + timedelta(days=14),
                'end_date': now + timedelta(days=15),
                'registration_deadline': now + timedelta(days=13),
                'location': 'Online',
                'is_online': True,
                'meeting_link': 'https://meet.example.com/art-exhibition',
                'status': 'PUBLISHED',
                'visibility': 'CLUB_MEMBERS'
            },
            {
                'title': 'Ongoing Hackathon',
                'description': 'Build innovative solutions',
                'organizer': admin_user,
                'start_date': now - timedelta(hours=12),
                'end_date': now + timedelta(hours=12),
                'location': 'Main Hall',
                'is_online': False,
                'max_participants': 30,
                'status': 'PUBLISHED',
                'visibility': 'PUBLIC'
            },
            {
                'title': 'Past Tech Talk',
                'description': 'Discussion about AI trends',
                'organizer': user1,
                'start_date': now - timedelta(days=7),
                'end_date': now - timedelta(days=7, hours=2),
                'location': 'Auditorium',
                'is_online': False,
                'status': 'COMPLETED',
                'visibility': 'PUBLIC'
            }
        ]

        for event_data in events_data:
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults={**event_data, 'created_by': event_data['organizer'], 'updated_by': event_data['organizer']}
            )
            
            if created:
                # Add some participants
                if event.title == 'Python Workshop':
                    EventParticipant.objects.get_or_create(event=event, user=user1, status='REGISTERED')
                    EventParticipant.objects.get_or_create(event=event, user=user2, status='WAITLISTED')
                elif event.title == 'Virtual Art Exhibition':
                    EventParticipant.objects.get_or_create(event=event, user=user2, status='REGISTERED')
                elif event.title == 'Past Tech Talk':
                    participant1, _ = EventParticipant.objects.get_or_create(event=event, user=user1, status='ATTENDED')
                    participant2, _ = EventParticipant.objects.get_or_create(event=event, user=user2, status='ATTENDED')

        self.stdout.write(self.style.SUCCESS('Successfully populated events data')) 