from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, User
from schemas import Order as OrderSchema
from auth import get_current_active_user
import os

router = APIRouter()

# Mock payment processing - in production, integrate with Stripe/PayPal
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")

@router.post("/orders/{order_id}/payment")
def process_payment(
    order_id: int,
    payment_method: str,  # "card", "paypal", "wallet"
    payment_token: str = None,  # For card tokens
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")

    # Mock payment processing
    try:
        # In production, integrate with actual payment provider
        if payment_method == "card":
            if not payment_token:
                raise HTTPException(status_code=400, detail="Payment token required for card payments")

            # Simulate Stripe payment processing
            # stripe.Charge.create(amount=int(order.total_amount * 100), ...)

        elif payment_method == "paypal":
            # Simulate PayPal payment
            pass

        # Update order payment status
        order.payment_status = "completed"
        db.commit()

        return {
            "message": "Payment processed successfully",
            "order_id": order_id,
            "amount": order.total_amount,
            "status": "completed"
        }

    except Exception as e:
        order.payment_status = "failed"
        db.commit()
        raise HTTPException(status_code=400, detail=f"Payment failed: {str(e)}")

@router.get("/orders/{order_id}/payment/status")
def get_payment_status(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order_id,
        "payment_status": order.payment_status,
        "total_amount": order.total_amount
    }

@router.post("/refunds/{order_id}")
def process_refund(
    order_id: int,
    amount: float = None,  # Partial refund amount, None for full refund
    reason: str = "Customer request",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Only admin or restaurant staff can process refunds
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized to process refunds")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status != "completed":
        raise HTTPException(status_code=400, detail="Order payment not completed")

    refund_amount = amount or order.total_amount

    if refund_amount > order.total_amount:
        raise HTTPException(status_code=400, detail="Refund amount exceeds order total")

    # Mock refund processing
    try:
        # In production, process refund with payment provider
        # stripe.Refund.create(charge=order.stripe_charge_id, amount=int(refund_amount * 100))

        # Update order status
        order.status = "refunded"
        order.payment_status = "refunded"
        db.commit()

        return {
            "message": "Refund processed successfully",
            "order_id": order_id,
            "refund_amount": refund_amount,
            "reason": reason
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Refund failed: {str(e)}")

# Split payment functionality
@router.post("/orders/{order_id}/split-payment")
def split_payment(
    order_id: int,
    splits: list,  # [{"user_id": 1, "amount": 10.50}, {"user_id": 2, "amount": 15.75}]
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    total_split = sum(split["amount"] for split in splits)
    if abs(total_split - order.total_amount) > 0.01:  # Allow small floating point differences
        raise HTTPException(status_code=400, detail="Split amounts don't match order total")

    # Mock split payment processing
    # In production, this would create separate charges for each user

    return {
        "message": "Split payment processed",
        "order_id": order_id,
        "splits": splits
    }
