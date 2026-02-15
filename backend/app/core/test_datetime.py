from app.core.datetime_extractor import extract_datetime
from app.nlp.datetime_nlp import nlp_extract_datetime

TEST_QUERIES = [
    # ---- BASIC ----
    "Book meeting today at 3 PM",
    "Schedule meeting tomorrow at 11 am",

    # ---- WEEKDAY LOGIC ----
    "Schedule meeting next friday at 10 am",
    "Book meeting next monday at 9 am",
    "Arrange meeting next sunday at 6 pm",

    # ---- EXPLICIT DATE ----
    "Arrange meeting on 5 October at 9 am",
    "Book meeting on 12 December at 4 pm",

    # ---- VARIATIONS ----
    "Please book a meeting today",
    "Can you schedule meeting tomorrow at 8 pm",
    "Set up meeting next wednesday",

    # ---- INVALID / EDGE ----
    "Schedule meeting sometime",
    "Book meeting soon",
    "have a meeting at 9am for 3days from 12th january",
    "meeting tommorow"
]

print("==== DATETIME EXTRACTION TESTS ====\n")

for query in TEST_QUERIES:
    result = extract_datetime(query)
    print(f"INPUT : {query}")
    print(f"OUTPUT: {result}")
    print("-" * 50)
