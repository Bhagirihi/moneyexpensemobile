import csv
import uuid
from datetime import datetime, timedelta
import random

# Constants
PROFILE_ID = "97d86741-0b79-4fef-98c5-480ebb21a963"  # Your user ID
BOARD_ID = "705dc06b-ee20-4b7b-9fea-3d9c2ab3e1d9"    # Your expense board ID

# First, let's create the expense board
def generate_expense_board():
    board = {
        "id": BOARD_ID,
        "name": "Sample Expense Board",
        "description": "Sample board with 365 days of expenses",
        "total_budget": "0.00",
        "created_by": PROFILE_ID,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "board_color": "#FF6B6B",
        "board_icon": "home",
        "per_person_budget": None,
        "share_code": None,
        "is_default": False
    }
    return board

# Generate categories with proper user_id
def generate_categories():
    categories = [
        {"id": str(uuid.uuid4()), "name": "Groceries", "icon": "cart", "color": "#FF6B6B", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Transport", "icon": "car", "color": "#4ECDC4", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Shopping", "icon": "shopping", "color": "#45B7D1", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Entertainment", "icon": "movie", "color": "#96CEB4", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Health", "icon": "heart", "color": "#FFEEAD", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Dining", "icon": "food", "color": "#FFB347", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Utilities", "icon": "home", "color": "#77DD77", "user_id": PROFILE_ID},
        {"id": str(uuid.uuid4()), "name": "Education", "icon": "school", "color": "#AEC6CF", "user_id": PROFILE_ID}
    ]
    return categories

# Generate expenses with proper data types and constraints
def generate_expenses(categories):
    expenses = []
    start_date = datetime.now() - timedelta(days=365)

    # Payment methods
    payment_methods = ["Card", "Cash", "UPI", "Bank Transfer", "Wallet"]

    # Category-specific amount ranges
    amount_ranges = {
        "Groceries": (200, 5000),
        "Transport": (50, 2000),
        "Shopping": (500, 10000),
        "Entertainment": (300, 5000),
        "Health": (500, 15000),
        "Dining": (200, 4000),
        "Utilities": (1000, 8000),
        "Education": (1000, 20000)
    }

    # Category-specific descriptions
    descriptions = {
        "Groceries": ["Weekly groceries", "Monthly supplies", "Supermarket shopping"],
        "Transport": ["Fuel", "Public transport", "Cab ride", "Train ticket"],
        "Shopping": ["Clothing", "Electronics", "Home decor", "Gifts"],
        "Entertainment": ["Movie tickets", "Concert", "Theme park", "Streaming service"],
        "Health": ["Doctor visit", "Medicines", "Health checkup", "Gym membership"],
        "Dining": ["Restaurant dinner", "Cafe lunch", "Takeout", "Food delivery"],
        "Utilities": ["Electricity bill", "Water bill", "Internet bill", "Gas bill"],
        "Education": ["Course fee", "Books", "Online course", "Workshop"]
    }

    for i in range(365):
        date = start_date + timedelta(days=i)
        category = random.choice(categories)
        category_name = category["name"]

        # Generate amount based on category
        min_amount, max_amount = amount_ranges.get(category_name, (100, 1000))
        amount = round(random.uniform(min_amount, max_amount), 2)

        # Generate description based on category
        category_descriptions = descriptions.get(category_name, ["Miscellaneous"])
        description = random.choice(category_descriptions)

        expense = {
            "board_id": BOARD_ID,
            "category_id": category["id"],
            "amount": str(amount),  # Convert to string for CSV
            "description": description,
            "date": date.isoformat(),
            "created_by": PROFILE_ID,
            "created_at": date.isoformat(),
            "updated_at": date.isoformat(),
            "payment_method": random.choice(payment_methods)
        }
        expenses.append(expense)

    return expenses

# Write data to CSV
def write_to_csv(data, filename, fieldnames):
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        if isinstance(data, list):
            for row in data:
                writer.writerow(row)
        else:
            writer.writerow(data)

# Generate and write all data
def main():
    # Generate expense board
    board = generate_expense_board()

    # Generate categories
    categories = generate_categories()

    # Generate expenses using the categories
    expenses = generate_expenses(categories)

    # Write expense board
    write_to_csv(
        board,
        'expense_board.csv',
        ['id', 'name', 'description', 'total_budget', 'created_by', 'created_at',
         'updated_at', 'board_color', 'board_icon', 'per_person_budget', 'share_code', 'is_default']
    )

    # Write categories
    write_to_csv(
        categories,
        'categories.csv',
        ['id', 'name', 'icon', 'color', 'user_id']
    )

    # Write expenses (without id column)
    write_to_csv(
        expenses,
        'expenses_365_days.csv',
        ['board_id', 'category_id', 'amount', 'description',
         'date', 'created_by', 'created_at', 'updated_at', 'payment_method']
    )

    print("Generated expense board in expense_board.csv")
    print("Generated category data in categories.csv")
    print("Generated 365 expense records in expenses_365_days.csv")

if __name__ == "__main__":
    main()
