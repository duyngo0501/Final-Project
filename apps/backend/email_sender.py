"""Email sending utilities using the Resend API.

Initializes the Resend client and provides functions for sending emails,
including a specific template generator for order confirmations.
"""

import logging
import os
from typing import Any

import resend

logger = logging.getLogger(__name__)

# Fetch Resend API key from environment variables.
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Initialize the Resend client globally.
if not RESEND_API_KEY:
    logger.warning("RESEND_API_KEY not set. Email sending disabled.")
    resend.api_key = None
else:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend client initialized.")


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    from_email: str = "GameShop <noreply@yourdomain.com>",  # TODO: Replace with verified sender
) -> bool:
    """Sends an email using the Resend API.

    Checks for the Resend API key before attempting to send.

    Args:
        to_email: Recipient's email address.
        subject: Email subject line.
        html_content: HTML content for the email body.
        from_email: Sender email address (must be verified in Resend).

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    if not resend.api_key:
        logger.error("Resend API key not configured. Cannot send email.")
        # Consider logging email content here during development if key is missing.
        return False

    try:
        params = {
            "from": from_email,
            "to": [to_email],  # API expects a list
            "subject": subject,
            "html": html_content,
        }
        email_response = resend.Emails.send(params)
        email_id = (
            email_response.get("id") if isinstance(email_response, dict) else None
        )
        if email_id:
            logger.info(f"Email sent via Resend. ID: {email_id}")
            return True
        else:
            logger.warning(f"Resend response lacked expected ID: {email_response}")
            return False
    except Exception as e:
        logger.error(f"Failed to send email via Resend to {to_email}: {e}")
        return False


def create_order_confirmation_html(order_data: dict[str, Any]) -> str:
    """Generates HTML content for an order confirmation email.

    Uses an f-string template to format order details.

    Args:
        order_data: Dictionary containing order details. Expected keys:
            `user_name` (str, optional): Customer's name.
            `order_id` (str): Unique order identifier.
            `order_date` (str): Formatted order date string.
            `total_amount_formatted` (str): Total amount formatted as currency.
            `items_list` (list[str]): List of formatted line item strings.
            `customer_email` (str): Customer's email.
            `customer_phone` (str, optional): Customer's phone number.

    Returns:
        The formatted HTML email body as a string.
    """
    # Safely extract data with defaults
    user_name = order_data.get("user_name", "quý khách")
    order_id = order_data.get("order_id", "[N/A]")
    order_date = order_data.get("order_date", "[N/A]")
    total_amount_formatted = order_data.get("total_amount_formatted", "[N/A]")
    items_list = order_data.get("items_list", ["[Không có sản phẩm]"])
    customer_email = order_data.get("customer_email", "[N/A]")
    customer_phone = order_data.get("customer_phone", "[N/A]")

    items_html = "<br>".join(items_list)

    # Simple HTML template for the email
    html_content = f"""
    <html>
        <head>
            <style>
                body {{ font-family: sans-serif; line-height: 1.6; color: #333; }}
                p {{ margin-bottom: 1em; }}
                hr {{ border: none; border-top: 1px solid #eee; margin: 1.5em 0; }}
                strong {{ font-weight: 600; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                .header {{ font-size: 1.2em; margin-bottom: 1em; }}
                .footer {{ margin-top: 1.5em; font-size: 0.9em; color: #777; }}
            </style>
        </head>
        <body>
            <div class="container">
                <p class="header">Xin chào {user_name},</p>
                <p>Cảm ơn bạn đã đặt hàng tại <strong>GameShop</strong>. Dưới đây là thông tin chi tiết đơn hàng của bạn:</p>
                <hr>
                <p>🧾 <strong>Mã đơn hàng:</strong> {order_id}<br>
                   📅 <strong>Ngày đặt:</strong> {order_date}<br>
                   💰 <strong>Tổng thanh toán:</strong> {total_amount_formatted}</p>
                <hr>
                <p>🕹️ <strong>Danh sách sản phẩm:</strong><br>
                   {items_html}
                </p>
                 <p>✉️ <strong>Email:</strong> {customer_email}<br>
                   📞 <strong>Số điện thoại:</strong> {customer_phone}</p>
                <hr>
                <p>👉 Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ gửi key hoặc hướng dẫn kích hoạt qua email trong thời gian sớm nhất.</p>
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.</p>
                <p class="footer">Trân trọng,<br>
                   <strong>Đội ngũ GameShop</strong></p>
            </div>
        </body>
    </html>
    """
    return html_content


def send_order_confirmation_email(to_email: str, order_details: dict[str, Any]) -> bool:
    """Constructs and sends an order confirmation email.

    Generates the HTML body using `create_order_confirmation_html` and
    sends it via `send_email`.

    Args:
        to_email: The customer's email address.
        order_details: Dictionary with data needed by the HTML template function.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    subject = f"🎮 Đơn hàng GameShop của bạn ({order_details.get('order_id', '')}) đã được xác nhận!"

    try:
        html_body = create_order_confirmation_html(order_data=order_details)
    except Exception as e:
        logger.error(f"Error generating order confirmation HTML: {e}")
        return False

    return send_email(to_email=to_email, subject=subject, html_content=html_body)


# Example usage block for manual testing (commented out by default).
# if __name__ == "__main__":
#     if resend.api_key:
#         print("Attempting to send test email...")
#         test_order_data = {
#             "user_name": "Test User",
#             "order_id": "TEST-ORD-123",
#             "order_date": "2024-01-01 12:00:00",
#             "total_amount_formatted": "$123.45",
#             "items_list": ["1 x Test Game @ $100.00", "1 x Test DLC @ $23.45"],
#             "customer_email": "delivered@resend.dev", # Use Resend's test address
#             "customer_phone": "N/A"
#         }
#         sent = send_order_confirmation_email(
#             to_email="delivered@resend.dev",
#             order_details=test_order_data
#         )
#         print(f"Test order confirmation sent: {sent}")
#     else:
#         print("Skipping email test: RESEND_API_KEY not set.")
