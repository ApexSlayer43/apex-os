declare module 'stripe' {
  namespace Stripe {
    interface Event {
      id: string
      type: string
      data: { object: any }
      [key: string]: any
    }
    namespace Checkout {
      interface Session {
        id: string
        metadata: Record<string, string> | null
        subscription: string | null
        customer: string | null
        [key: string]: any
      }
    }
    interface Subscription {
      id: string
      status: string
      metadata: Record<string, string> | null
      items: { data: Array<{ price: { id: string; [key: string]: any }; [key: string]: any }> }
      [key: string]: any
    }
    interface Invoice {
      id: string
      subscription: string | null
      [key: string]: any
    }
  }

  class Stripe {
    constructor(apiKey: string, config?: Record<string, any>)
    webhooks: { constructEvent(payload: string, sig: string, secret: string): Stripe.Event }
    checkout: { sessions: { create(params: any): Promise<any> } }
    billingPortal: { sessions: { create(params: any): Promise<any> } }
    subscriptions: { retrieve(id: string): Promise<Stripe.Subscription>; update(id: string, params: any): Promise<any> }
    customers: { create(params: any): Promise<any>; retrieve(id: string): Promise<any> }
    [key: string]: any
  }

  export default Stripe
}
