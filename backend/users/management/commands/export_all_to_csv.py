import os
import csv
from django.core.management.base import BaseCommand
from django.apps import apps
from django.conf import settings

class Command(BaseCommand):
    help = 'Export all data from all models to CSV files'

    def handle(self, *args, **options):
        output_dir = os.path.join(settings.BASE_DIR, 'csv_exports')
        os.makedirs(output_dir, exist_ok=True)

        for model in apps.get_models():
            model_name = model.__name__
            file_path = os.path.join(output_dir, f"{model_name}.csv")
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                fields = [field.name for field in model._meta.fields]
                writer.writerow(fields)
                for obj in model.objects.all():
                    row = [getattr(obj, field) for field in fields]
                    writer.writerow(row)
            self.stdout.write(self.style.SUCCESS(f"Exported {model_name} to {file_path}"))
