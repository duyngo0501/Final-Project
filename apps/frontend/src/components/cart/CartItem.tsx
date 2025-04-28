import React, { useState, useCallback } from "react";
import {
  List,
  Button,
  InputNumber,
  Typography,
  Space,
  Image,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { CartItemResponse as CartItem } from "@/gen/types"; // Use the generated type alias
import { useCart } from "@/contexts/CartContext";

const { Text } = Typography;

interface CartItemProps {
  item: CartItem;
}

/**
 * @description Renders a single item in the shopping cart.
 * Handles quantity updates and item removal locally by calling context actions.
 * @param {CartItemProps} props Component props containing the cart item.
 * @returns {React.ReactElement} The rendered CartItem component.
 */
const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  // Get actions and global mutation state from context
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const isMutatingGlobal = useCart((state) => state.isMutating); // Global loading state

  // Local state for this specific item's actions
  const [isUpdatingOrRemoving, setIsUpdatingOrRemoving] = useState(false);

  const { id: cartItemId, quantity, game, game_id } = item; // Destructure item
  const { name, background_image, price } = game ?? {}; // Safely access nested game properties

  const handleQuantityChange = useCallback(
    async (newQuantity: number | null) => {
      if (newQuantity === null || newQuantity < 1) {
        return; // Or handle as removal if quantity is 0? Context currently prevents <= 0
      }
      if (newQuantity === quantity) {
        return; // No change
      }
      setIsUpdatingOrRemoving(true);
      try {
        await updateQuantity(game_id, newQuantity);
        // message.success("Quantity updated"); // Context shows messages
      } catch (err) {
        // message.error("Failed to update quantity"); // Context shows messages
        console.error("Update quantity error in CartItem:", err);
      } finally {
        setIsUpdatingOrRemoving(false);
      }
    },
    [game_id, quantity, updateQuantity]
  );

  const handleRemoveItem = useCallback(async () => {
    setIsUpdatingOrRemoving(true);
    try {
      await removeItem(game_id);
      // message.success("Item removed"); // Context shows messages
    } catch (err) {
      // message.error("Failed to remove item"); // Context shows messages
      console.error("Remove item error in CartItem:", err);
    } finally {
      // No need to set loading false if component potentially unmounts
      // setIsUpdatingOrRemoving(false);
    }
  }, [game_id, removeItem]);

  // Calculate item subtotal - Use price from game object
  const itemSubtotal = (price ?? 0) * quantity;
  const displayPrice = price !== null && price !== undefined;

  return (
    <List.Item
      key={cartItemId} // Use CartEntry id as key
      className="bg-white p-4 rounded-lg shadow mb-4"
      actions={[
        <InputNumber
          key="quantity"
          min={1}
          max={99} // Set a reasonable max
          value={quantity}
          onChange={handleQuantityChange}
          style={{ width: 60 }}
          disabled={isUpdatingOrRemoving || isMutatingGlobal} // Disable if this or any action is happening
          aria-label={`Quantity for ${name ?? `item ${game_id}`}`}
        />,
        <Text
          strong
          key="subtotal"
          style={{ minWidth: 80, textAlign: "right" }}
        >
          {displayPrice ? `$${itemSubtotal.toFixed(2)}` : "-"}
        </Text>,
        <Button
          key="remove"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={handleRemoveItem}
          loading={isUpdatingOrRemoving} // Show loading only for this item's removal
          disabled={isMutatingGlobal} // Disable if any global mutation is happening
          aria-label={`Remove ${name ?? `item ${game_id}`}`}
        />,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Image
            width={80}
            height={80}
            src={background_image ?? "/placeholder-image.jpg"}
            alt={name ?? `Item ${game_id}`}
            preview={false}
            style={{ objectFit: "cover", borderRadius: "4px" }}
            fallback="/placeholder-image.jpg" // Consistent fallback
          />
        }
        title={name ?? `Item ID: ${game_id}`} // Display name if available
        description={
          displayPrice
            ? `Price: $${price.toFixed(2)} each`
            : "Price unavailable"
        }
      />
    </List.Item>
  );
};

export default CartItemComponent;
