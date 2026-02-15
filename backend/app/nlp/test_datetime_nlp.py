from app.nlp.datetime_nlp import nlp_extract_datetime

TEST_QUERIES = [
    # ---- SPELLING ----
    "meeting tommorow",
    "book meeting next fridy",

    # ---- COMPLEX NLP ----
    "have a meeting at 9am for 3days from 12th january",

    # ---- SHOULD FAIL (INTENTIONALLY) ----
    "schedule meeting sometime",
    "book meeting soon",
]

print("\n==== NLP DATETIME TEST ====\n")

for query in TEST_QUERIES:
    print("INPUT :", query)
    print("OUTPUT:", nlp_extract_datetime(query))
    print("-" * 50)
