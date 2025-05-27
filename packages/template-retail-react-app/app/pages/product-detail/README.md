# Product Detail Page

This directory contains the implementation of the **Product Detail Page** for the PWA Kit-based Retail React App.

It handles:

* Rendering product information such as images, price, and description.
* Fetching category and wishlist data.
* Supporting server-side rendering (SSR) and hydration on the client.
* Coordinating data from multiple Salesforce Commerce API (SCAPI) endpoints.

## Page Responsibilities

* **Server-side (MRT)**: Pre-renders the page for initial load, including product and category data, if not served from cache.
* **Client-side**: Hydrates the page and performs additional API calls to fetch live and personalized data (e.g., basket, wishlist, analytics).

---

## Network Request Flow

The following sequence diagram outlines the network activity involved in rendering the product detail page, both on the server and client.

```mermaid
%%{ init: { "theme": "default" } }%%
sequenceDiagram
    title Request Flow (Product Detail Page)

    participant Browser
    participant MRT as Server (mrt)
    participant SCAPI as Commerce API (scapi)

    Browser->>MRT: Initial page request

    alt MRT Page Cache: Hit
      rect rgb(230,255,230)
        
        MRT-->>Browser: HTML + assets (~200ms)
      end
    else MRT Page Cache: Miss
      rect rgb(255,230,230)
        MRT->>SCAPI: POST /oauth2/token
        SCAPI-->>MRT: Access token (???ms)
      end 
      
      Note over MRT,SCAPI: All parallel requests use token from previous authentication.

      par Fetch Page Data
        rect rgb(255,230,230)
          MRT->>SCAPI: GET /product
          SCAPI-->>MRT: JSON (~300ms)
        end 

        and
        rect rgb(255, 238, 140)
          MRT->>SCAPI: GET /categories/root
          SCAPI-->>MRT: JSON (~225ms)
        end 
        
      end

      rect rgb(255,230,230)
        MRT-->>Browser: HTML + assets (~3000ms)
      end

    end

    Note over Browser, SCAPI: Once the HTML and Javascript is parsed and loaded the application is hydrated and interactable.

    alt Valid Access Token: No
      rect rgb(255,230,230)
        Browser->>SCAPI: POST /oauth2/token
        SCAPI-->>Browser: Access token (~600ms)
      end 
    else Valid Access Token: Yes
        Note right of Browser: Assuming the token stored in the browser is valid, no authentication is required.
    end 

    Note over Browser,SCAPI: All parallel requests below use token from previous authentication.
    Note over Browser,SCAPI: Data that was fetched on the server is not re-fetched during hydration.

    par Parallel Data Fetch

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /categories/womens-clothing-tops
        SCAPI-->>Browser: JSON (~725ms)
      end 

      and
      rect rgb(255,230,230)
        Browser->>SCAPI: GET /customers/baskets
        SCAPI-->>Browser: JSON (~400ms)
      end 

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /product-lists
        SCAPI-->>Browser: JSON (~400ms)
      end 

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /product-lists (wish-list)
        SCAPI-->>Browser: JSON (~450ms)
      end 

      and
      rect rgb(255,230,230)
        Browser->>SCAPI: POST /viewProduct (~175ms)
      end 

      and
      rect rgb(255,230,230)
        Browser->>SCAPI: GET /__Analytics-Start (~400ms)
      end 

      and
      rect rgb(255, 238, 140)
        Browser->>SCAPI: POST /web/events/... (~75ms)
        Note right of Browser: Request does not use the mobify proxy.
      end 
      
    end

    Note over Browser,SCAPI: All requests are made through mobify proxy (both on the server and client) unless specified otherwise.
```

### Summary of Flow

#### On the Server (MRT):

* **Initial Page Request** is received by the server.
* If the **page is cached**, the response is quick (\~200ms).
* If **not cached**:

  * MRT authenticates with SCAPI (`/oauth2/token`).
  * Makes **parallel** SCAPI calls to:

    * Fetch product data (`/product`)
    * Fetch root category (`/categories/root`)
  * Sends the full HTML and assets to the browser (\~3000ms total).

#### On the Client (Browser):

* Once the HTML and JS are parsed, the app **hydrates**.
* If there's **no valid access token**, the browser authenticates with SCAPI.
* Then, the browser performs **multiple parallel requests**, including:

  * Product details (`/products/{id}`)
  * Category hierarchy (`/categories/...`)
  * Current basket (`/customers/baskets`)
  * Wishlist and product lists (`/product-lists`)
  * Analytics tracking (`/viewProduct`, `/__Analytics-Start`, `/web/events/...`)

#### Other Notes:

* All requests go through the **Mobify proxy**, unless explicitly noted (like `/web/events/...`).
* The server and browser **reuse** the same SCAPI access token where possible.
* The SSR and hydration steps ensure a fast, SEO-friendly, and interactive product page.
