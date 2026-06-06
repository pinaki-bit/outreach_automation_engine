import json
from outreach_engine.backend.services import apollo, ocean, prospeo, eazyreach, zerobounce, brevo, gemini

status = {
    "apollo": apollo.is_live(),
    "ocean": ocean.is_live(),
    "prospeo": prospeo.is_live(),
    "eazyreach": eazyreach.is_live(),
    "zerobounce": zerobounce.is_live(),
    "brevo": brevo.is_live(),
    "gemini": gemini.is_live(),
}
print(json.dumps(status))
