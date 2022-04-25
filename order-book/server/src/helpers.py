def create_response(success, message, data):
    response =  { 
                    "status": {
                        "success": success,
                        "message": message
                    }
                }
    if data:
        response["data"] = data

    return response

def get_product_id(symbol, cursor):
    try:
        product_id = cursor.execute(
            "SELECT id FROM products WHERE symbol = ?", (symbol,)
        ).fetchone()[0]
    except:
        return None

    return product_id


def get_address_id(sender, cursor):
    try:
        address_id = cursor.execute(
            "SELECT id FROM accounts WHERE address = ?", (sender,)
        ).fetchone()[0]
    except:
        return None

    return address_id