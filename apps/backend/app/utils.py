import random
import string


def generate_custom_id(prefix: str, length: int = 29) -> str:
    # Ensure prefix is 2 characters
    if len(prefix) != 2:
        raise ValueError("Prefix must be exactly 2 characters long.")

    # Generate random ASCII letters and digits
    random_chars = "".join(
        random.choices(string.ascii_letters + string.digits, k=length)
    )

    # Use underscore as separator
    return f"{prefix}_{random_chars}"


# Example usage (can be removed later):
# print(generate_custom_id("us"))
# print(generate_custom_id("ga"))
