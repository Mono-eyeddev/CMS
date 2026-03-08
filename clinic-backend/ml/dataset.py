import pandas as pd
from accounts.models import ClinicKPI


def load_dataset():

    data = ClinicKPI.objects.all().values()

    df = pd.DataFrame(list(data))

    return df