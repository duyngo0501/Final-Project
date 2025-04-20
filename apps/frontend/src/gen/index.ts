export type { AuthLogin200, AuthLoginMutationResponse, AuthLoginMutation } from './types/AuthLogin.ts'
export type {
  AuthRegisterUser200,
  AuthRegisterUser422,
  AuthRegisterUserMutationRequest,
  AuthRegisterUserMutationResponse,
  AuthRegisterUserMutation,
} from './types/AuthRegisterUser.ts'
export type { BaseProperties } from './types/BaseProperties.ts'
export type {
  CartAddItemToCart201,
  CartAddItemToCart422,
  CartAddItemToCartMutationRequest,
  CartAddItemToCartMutationResponse,
  CartAddItemToCartMutation,
} from './types/CartAddItemToCart.ts'
export type { CartClearCart204, CartClearCartMutationResponse, CartClearCartMutation } from './types/CartClearCart.ts'
export type { CartItemCreateSchema } from './types/CartItemCreateSchema.ts'
export type { CartItemResponseSchema } from './types/CartItemResponseSchema.ts'
export type { CartItemUpdateSchema } from './types/CartItemUpdateSchema.ts'
export type { CartReadCart200, CartReadCartQueryResponse, CartReadCartQuery } from './types/CartReadCart.ts'
export type {
  CartRemoveItemFromCartPathParams,
  CartRemoveItemFromCart204,
  CartRemoveItemFromCart422,
  CartRemoveItemFromCartMutationResponse,
  CartRemoveItemFromCartMutation,
} from './types/CartRemoveItemFromCart.ts'
export type { CartResponseSchema } from './types/CartResponseSchema.ts'
export type {
  CartUpdateCartItemQuantityPathParams,
  CartUpdateCartItemQuantity200,
  CartUpdateCartItemQuantity422,
  CartUpdateCartItemQuantityMutationRequest,
  CartUpdateCartItemQuantityMutationResponse,
  CartUpdateCartItemQuantityMutation,
} from './types/CartUpdateCartItemQuantity.ts'
export type { CustomGameCreate } from './types/CustomGameCreate.ts'
export type { CustomGamePublic } from './types/CustomGamePublic.ts'
export type { DiscountTypeEnum, DiscountType } from './types/DiscountType.ts'
export type { GenreInfo } from './types/GenreInfo.ts'
export type { HTTPValidationError } from './types/HTTPValidationError.ts'
export type { OrderCreateSchema } from './types/OrderCreateSchema.ts'
export type { OrderItemCreateSchema } from './types/OrderItemCreateSchema.ts'
export type { OrderItemResponseSchema } from './types/OrderItemResponseSchema.ts'
export type { OrderResponseSchema } from './types/OrderResponseSchema.ts'
export type {
  OrdersCreateOrder201,
  OrdersCreateOrder422,
  OrdersCreateOrderMutationRequest,
  OrdersCreateOrderMutationResponse,
  OrdersCreateOrderMutation,
} from './types/OrdersCreateOrder.ts'
export type {
  OrdersGetMyOrdersQueryParams,
  OrdersGetMyOrders200,
  OrdersGetMyOrders422,
  OrdersGetMyOrdersQueryResponse,
  OrdersGetMyOrdersQuery,
} from './types/OrdersGetMyOrders.ts'
export type { ParentPlatformInfo } from './types/ParentPlatformInfo.ts'
export type { PlatformInfo } from './types/PlatformInfo.ts'
export type { Product } from './types/Product.ts'
export type { ProductListingResponse } from './types/ProductListingResponse.ts'
export type {
  ProductsCreateCustomGameEndpoint201,
  ProductsCreateCustomGameEndpoint422,
  ProductsCreateCustomGameEndpointMutationRequest,
  ProductsCreateCustomGameEndpointMutationResponse,
  ProductsCreateCustomGameEndpointMutation,
} from './types/ProductsCreateCustomGameEndpoint.ts'
export type {
  ProductsDeleteCustomGameEndpointPathParams,
  ProductsDeleteCustomGameEndpoint204,
  ProductsDeleteCustomGameEndpoint422,
  ProductsDeleteCustomGameEndpointMutationResponse,
  ProductsDeleteCustomGameEndpointMutation,
} from './types/ProductsDeleteCustomGameEndpoint.ts'
export type {
  ProductsListProductsQueryParams,
  ProductsListProducts200,
  ProductsListProducts422,
  ProductsListProductsQueryResponse,
  ProductsListProductsQuery,
} from './types/ProductsListProducts.ts'
export type { PromotionCreate } from './types/PromotionCreate.ts'
export type { PromotionResponse } from './types/PromotionResponse.ts'
export type {
  PromotionsCreatePromotion201,
  PromotionsCreatePromotion422,
  PromotionsCreatePromotionMutationRequest,
  PromotionsCreatePromotionMutationResponse,
  PromotionsCreatePromotionMutation,
} from './types/PromotionsCreatePromotion.ts'
export type {
  PromotionsDeletePromotionPathParams,
  PromotionsDeletePromotion204,
  PromotionsDeletePromotion422,
  PromotionsDeletePromotionMutationResponse,
  PromotionsDeletePromotionMutation,
} from './types/PromotionsDeletePromotion.ts'
export type {
  PromotionsReadPromotionPathParams,
  PromotionsReadPromotion200,
  PromotionsReadPromotion422,
  PromotionsReadPromotionQueryResponse,
  PromotionsReadPromotionQuery,
} from './types/PromotionsReadPromotion.ts'
export type {
  PromotionsReadPromotionsQueryParams,
  PromotionsReadPromotions200,
  PromotionsReadPromotions422,
  PromotionsReadPromotionsQueryResponse,
  PromotionsReadPromotionsQuery,
} from './types/PromotionsReadPromotions.ts'
export type {
  PromotionsUpdatePromotionPathParams,
  PromotionsUpdatePromotion200,
  PromotionsUpdatePromotion422,
  PromotionsUpdatePromotionMutationRequest,
  PromotionsUpdatePromotionMutationResponse,
  PromotionsUpdatePromotionMutation,
} from './types/PromotionsUpdatePromotion.ts'
export type { PromotionUpdate } from './types/PromotionUpdate.ts'
export type { UserCreateSchema } from './types/UserCreateSchema.ts'
export type { UserReadSchema } from './types/UserReadSchema.ts'
export type { UtilsHealthCheck200, UtilsHealthCheckQueryResponse, UtilsHealthCheckQuery } from './types/UtilsHealthCheck.ts'
export type { ValidationError } from './types/ValidationError.ts'
export { authLogin } from './client/authLogin.ts'
export { authRegisterUser } from './client/authRegisterUser.ts'
export { cartAddItemToCart } from './client/cartAddItemToCart.ts'
export { cartClearCart } from './client/cartClearCart.ts'
export { cartReadCart } from './client/cartReadCart.ts'
export { cartRemoveItemFromCart } from './client/cartRemoveItemFromCart.ts'
export { cartUpdateCartItemQuantity } from './client/cartUpdateCartItemQuantity.ts'
export { ordersCreateOrder } from './client/ordersCreateOrder.ts'
export { ordersGetMyOrders } from './client/ordersGetMyOrders.ts'
export { productsCreateCustomGameEndpoint } from './client/productsCreateCustomGameEndpoint.ts'
export { productsDeleteCustomGameEndpoint } from './client/productsDeleteCustomGameEndpoint.ts'
export { productsListProducts } from './client/productsListProducts.ts'
export { promotionsCreatePromotion } from './client/promotionsCreatePromotion.ts'
export { promotionsDeletePromotion } from './client/promotionsDeletePromotion.ts'
export { promotionsReadPromotion } from './client/promotionsReadPromotion.ts'
export { promotionsReadPromotions } from './client/promotionsReadPromotions.ts'
export { promotionsUpdatePromotion } from './client/promotionsUpdatePromotion.ts'
export { utilsHealthCheck } from './client/utilsHealthCheck.ts'
export { discountTypeEnum } from './types/DiscountType.ts'
export { authLogin200Schema, authLoginMutationResponseSchema } from './zod/authLoginSchema.ts'
export {
  authRegisterUser200Schema,
  authRegisterUser422Schema,
  authRegisterUserMutationRequestSchema,
  authRegisterUserMutationResponseSchema,
} from './zod/authRegisterUserSchema.ts'
export { basePropertiesSchema } from './zod/basePropertiesSchema.ts'
export {
  cartAddItemToCart201Schema,
  cartAddItemToCart422Schema,
  cartAddItemToCartMutationRequestSchema,
  cartAddItemToCartMutationResponseSchema,
} from './zod/cartAddItemToCartSchema.ts'
export { cartClearCart204Schema, cartClearCartMutationResponseSchema } from './zod/cartClearCartSchema.ts'
export { cartItemCreateSchemaSchema } from './zod/cartItemCreateSchemaSchema.ts'
export { cartItemResponseSchemaSchema } from './zod/cartItemResponseSchemaSchema.ts'
export { cartItemUpdateSchemaSchema } from './zod/cartItemUpdateSchemaSchema.ts'
export { cartReadCart200Schema, cartReadCartQueryResponseSchema } from './zod/cartReadCartSchema.ts'
export {
  cartRemoveItemFromCartPathParamsSchema,
  cartRemoveItemFromCart204Schema,
  cartRemoveItemFromCart422Schema,
  cartRemoveItemFromCartMutationResponseSchema,
} from './zod/cartRemoveItemFromCartSchema.ts'
export { cartResponseSchemaSchema } from './zod/cartResponseSchemaSchema.ts'
export {
  cartUpdateCartItemQuantityPathParamsSchema,
  cartUpdateCartItemQuantity200Schema,
  cartUpdateCartItemQuantity422Schema,
  cartUpdateCartItemQuantityMutationRequestSchema,
  cartUpdateCartItemQuantityMutationResponseSchema,
} from './zod/cartUpdateCartItemQuantitySchema.ts'
export { customGameCreateSchema } from './zod/customGameCreateSchema.ts'
export { customGamePublicSchema } from './zod/customGamePublicSchema.ts'
export { discountTypeSchema } from './zod/discountTypeSchema.ts'
export { genreInfoSchema } from './zod/genreInfoSchema.ts'
export { HTTPValidationErrorSchema } from './zod/HTTPValidationErrorSchema.ts'
export { orderCreateSchemaSchema } from './zod/orderCreateSchemaSchema.ts'
export { orderItemCreateSchemaSchema } from './zod/orderItemCreateSchemaSchema.ts'
export { orderItemResponseSchemaSchema } from './zod/orderItemResponseSchemaSchema.ts'
export { orderResponseSchemaSchema } from './zod/orderResponseSchemaSchema.ts'
export {
  ordersCreateOrder201Schema,
  ordersCreateOrder422Schema,
  ordersCreateOrderMutationRequestSchema,
  ordersCreateOrderMutationResponseSchema,
} from './zod/ordersCreateOrderSchema.ts'
export {
  ordersGetMyOrdersQueryParamsSchema,
  ordersGetMyOrders200Schema,
  ordersGetMyOrders422Schema,
  ordersGetMyOrdersQueryResponseSchema,
} from './zod/ordersGetMyOrdersSchema.ts'
export { parentPlatformInfoSchema } from './zod/parentPlatformInfoSchema.ts'
export { platformInfoSchema } from './zod/platformInfoSchema.ts'
export { productListingResponseSchema } from './zod/productListingResponseSchema.ts'
export { productSchema } from './zod/productSchema.ts'
export {
  productsCreateCustomGameEndpoint201Schema,
  productsCreateCustomGameEndpoint422Schema,
  productsCreateCustomGameEndpointMutationRequestSchema,
  productsCreateCustomGameEndpointMutationResponseSchema,
} from './zod/productsCreateCustomGameEndpointSchema.ts'
export {
  productsDeleteCustomGameEndpointPathParamsSchema,
  productsDeleteCustomGameEndpoint204Schema,
  productsDeleteCustomGameEndpoint422Schema,
  productsDeleteCustomGameEndpointMutationResponseSchema,
} from './zod/productsDeleteCustomGameEndpointSchema.ts'
export {
  productsListProductsQueryParamsSchema,
  productsListProducts200Schema,
  productsListProducts422Schema,
  productsListProductsQueryResponseSchema,
} from './zod/productsListProductsSchema.ts'
export { promotionCreateSchema } from './zod/promotionCreateSchema.ts'
export { promotionResponseSchema } from './zod/promotionResponseSchema.ts'
export {
  promotionsCreatePromotion201Schema,
  promotionsCreatePromotion422Schema,
  promotionsCreatePromotionMutationRequestSchema,
  promotionsCreatePromotionMutationResponseSchema,
} from './zod/promotionsCreatePromotionSchema.ts'
export {
  promotionsDeletePromotionPathParamsSchema,
  promotionsDeletePromotion204Schema,
  promotionsDeletePromotion422Schema,
  promotionsDeletePromotionMutationResponseSchema,
} from './zod/promotionsDeletePromotionSchema.ts'
export {
  promotionsReadPromotionPathParamsSchema,
  promotionsReadPromotion200Schema,
  promotionsReadPromotion422Schema,
  promotionsReadPromotionQueryResponseSchema,
} from './zod/promotionsReadPromotionSchema.ts'
export {
  promotionsReadPromotionsQueryParamsSchema,
  promotionsReadPromotions200Schema,
  promotionsReadPromotions422Schema,
  promotionsReadPromotionsQueryResponseSchema,
} from './zod/promotionsReadPromotionsSchema.ts'
export {
  promotionsUpdatePromotionPathParamsSchema,
  promotionsUpdatePromotion200Schema,
  promotionsUpdatePromotion422Schema,
  promotionsUpdatePromotionMutationRequestSchema,
  promotionsUpdatePromotionMutationResponseSchema,
} from './zod/promotionsUpdatePromotionSchema.ts'
export { promotionUpdateSchema } from './zod/promotionUpdateSchema.ts'
export { userCreateSchemaSchema } from './zod/userCreateSchemaSchema.ts'
export { userReadSchemaSchema } from './zod/userReadSchemaSchema.ts'
export { utilsHealthCheck200Schema, utilsHealthCheckQueryResponseSchema } from './zod/utilsHealthCheckSchema.ts'
export { validationErrorSchema } from './zod/validationErrorSchema.ts'