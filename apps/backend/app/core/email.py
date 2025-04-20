import logging
import os

import resend

logger = logging.getLogger(__name__)

# Fetch API key from environment variables
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if not RESEND_API_KEY:
    logger.warning("RESEND_API_KEY environment variable not set. Email sending will be disabled.")
    resend.api_key = None # Or handle this more gracefully depending on requirements
else:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend client initialized.")

def send_email(
    to_email: str,
    subject: str,
    html_content: str, 
    from_email: str = "GameShop <noreply@yourdomain.com>" # Replace with your verified Resend domain/sender
) -> bool:
    """
    Sends an email using the Resend API.

    Args:
        to_email: The recipient's email address.
        subject: The email subject line.
        html_content: The HTML content of the email body.
        from_email: The sender email address (must be configured in Resend).

    Returns:
        True if the email was sent successfully (or mocked), False otherwise.
    """
    if not resend.api_key:
        logger.error("Resend API key not configured. Cannot send email.")
        # In development, you might want to log the email content instead of failing
        # logger.info(f"--- Mock Email Send ---")
        # logger.info(f"To: {to_email}")
        # logger.info(f"Subject: {subject}")
        # logger.info(f"Body:\n{html_content}")
        # return True # Simulate success in dev if key is missing
        return False

    try:
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        email_response = resend.Emails.send(params)
        logger.info(f"Email sent successfully via Resend. ID: {email_response.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via Resend to {to_email}: {e}")
        # Consider more specific error handling based on Resend exceptions if available
        return False

def create_order_confirmation_html(
    user_name: str, 
    order_id: str, 
    order_date: str, # Formatted date string
    total_amount_formatted: str, # Formatted currency string
    items_list: list[str], # List of formatted item strings (e.g., "1. GTA V – 250.000đ")
    customer_email: str,
    customer_phone: str
) -> str:
    """
    Generates the HTML content for the order confirmation email.

    Args:
        user_name: The name of the user (or placeholder).
        order_id: The order ID (e.g., #ORD123456).
        order_date: Formatted order date string.
        total_amount_formatted: Formatted total amount string.
        items_list: List of strings, each representing a line item.
        customer_email: Customer's email.
        customer_phone: Customer's phone number.

    Returns:
        The formatted HTML email body.
    """
    items_html = "<br>".join(items_list)
    
    html_content = f"""
    <html>
        <body>
            <p>Xin chào {user_name or 'quý khách'},</p>
            <p>Cảm ơn bạn đã đặt hàng tại GameShop. Dưới đây là thông tin đơn hàng của bạn:</p>
            <hr>
            <p>🧾 Mã đơn: {order_id}<br>
               📅 Ngày đặt: {order_date}<br>
               💰 Tổng thanh toán: {total_amount_formatted}</p>
            <hr>
            <p>🕹️ Danh sách sản phẩm:<br>
               {items_html}
            </p>
            <p>📩 Email: {customer_email}<br>
               📞 Số điện thoại: {customer_phone}</p>
            <p>👉 Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ gửi key/kích hoạt qua email trong vòng 10 phút.</p>
            <p>Trân trọng,<br>
               <strong>GameShop Team</strong></p>
        </body>
    </html>
    """
    return html_content

# Optional: Wrapper function for sending the confirmation email
def send_order_confirmation_email(
    to_email: str,
    order_details: dict # Dictionary containing all needed keys for the template
) -> bool:
    """
    Constructs and sends the order confirmation email.
    """
    subject = f"🎮 Cảm ơn bạn đã đặt hàng tại GameShop! ({order_details.get('order_id', '')})"
    
    try:
        html_body = create_order_confirmation_html(
            user_name=order_details.get('user_name', ''), # Or fetch from User model if available
            order_id=order_details.get('order_id', 'N/A'),
            order_date=order_details.get('order_date', 'N/A'), # Ensure this is pre-formatted
            total_amount_formatted=order_details.get('total_amount_formatted', 'N/A'), # Ensure this is pre-formatted
            items_list=order_details.get('items_list', []),
            customer_email=order_details.get('customer_email', 'N/A'),
            customer_phone=order_details.get('customer_phone', 'N/A')
        )
    except KeyError as e:
        logger.error(f"Missing key in order_details for email template: {e}")
        return False
        
    return send_email(to_email=to_email, subject=subject, html_content=html_body)

# Example usage (for testing):
# if __name__ == "__main__":
#     test_to = "test@example.com"
#     test_subject = "Test Email from Resend Utility"
#     test_html = "<h1>Hello!</h1><p>This is a test email sent using the Resend utility.</p>"
#     if RESEND_API_KEY: # Only run if key is potentially set
#         send_email(test_to, test_subject, test_html)
#     else:
#         print("Skipping email test: RESEND_API_KEY not set.") 
