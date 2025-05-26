# Product List Page

This directory contains the implementation of the **Product List Page** for the PWA Kit-based Retail React App.

It supports:

* Server-side rendering (SSR) of product search results.
* Filtering and navigation across category pages.
* Client-side hydration and subsequent personalization.

---

## Page Responsibilities

* **Server-side (MRT)**:

  * Serves cached HTML if available.
  * Otherwise, fetches product search results and category metadata before rendering.
* **Client-side**:

  * Hydrates the app.
  * Fetches personalized and dynamic data like customer baskets, wishlists, and analytics.

---

## Network Request Flow

The following sequence diagram shows how the Product List Page coordinates network activity between the browser, the server (MRT), and Salesforce Commerce APIs (SCAPI):

```mermaid
%%{ init: { "theme": "default" } }%%
sequenceDiagram
    title Request Flow (Product List Page)

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
        SCAPI-->>MRT: Access token (300ms)
      end 
      
      Note over MRT,SCAPI: All parallel requests use token from previous authentication.

      par Fetch Page Data
        rect rgb(255,230,230)
          MRT->>SCAPI: GET /product-search
          SCAPI-->>MRT: JSON (~2800ms)
        end 

        and
        rect rgb(255, 238, 140)
          MRT->>SCAPI: GET /categories/root
          SCAPI-->>MRT: JSON (~140ms)
        end 

        and
        rect rgb(255, 238, 140)
          MRT->>SCAPI: GET /categories/womens
          SCAPI-->>MRT: JSON (~250ms)
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
        SCAPI-->>Browser: Access token (~300ms)
      end 
    else Valid Access Token: Yes
        Note right of Browser: Assuming the token stored in the browser is valid, no authentication is required.
    end 

    Note over Browser,SCAPI: All parallel requests below use token from previous authentication.

    par Parallel Data Fetch

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /categories/baskets
        SCAPI-->>Browser: JSON (~500ms)
      end 

      and
      rect rgb(255,230,230)
        Browser->>SCAPI: GET /product-search
        SCAPI-->>Browser: JSON (~1500ms)
      end 

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /categories/womens
        SCAPI-->>Browser: JSON (~300ms)
      end 

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /product-lists
        SCAPI-->>Browser: JSON (~450ms)
      end 

      rect rgb(255,230,230)
        Browser->>SCAPI: GET /categories/root
        SCAPI-->>Browser: JSON (~550ms)
      end 

      rect rgb(255,230,230)
        Browser->>SCAPI: POST /product-lists (wish-list)
        SCAPI-->>Browser: JSON (~500ms)
      end 

      and
      rect rgb(255,230,230)
        Browser->>SCAPI: POST /viewCategory (~175ms)
      end 

      and
      rect rgb(255,230,230)
        Browser->>SCAPI: POST /__Analytics-Start (~600ms)
      end 

      and
      rect rgb(255, 238, 140)
        Browser->>SCAPI: POST /web/events/... (~100ms)
        Note right of Browser: Request does not use the mobify proxy.
      end 
      
    end

    Note over Browser,SCAPI: All requests are made through mobify proxy (both on the server and client) unless specified otherwise.
```

### Summary of Flow

#### On the Server (MRT):

* The browser initiates the request for the product list page.
* If the **page is cached**, it's returned quickly (\~200ms).
* If it's a **cache miss**:

  * MRT authenticates with SCAPI (`/oauth2/token`).
  * Then, **in parallel**, it requests:

    * Product search results (`/product-search`)
    * Root category metadata (`/categories/root`)
    * Subcategory data (e.g. `/categories/womens`)
  * MRT sends rendered HTML + JS back to the browser (\~3000ms).

#### On the Client (Browser):

* Once hydrated, the browser verifies if it has a valid SCAPI access token.
* If not, it authenticates by calling `/oauth2/token` (\~300ms).
* Then, several **parallel requests** are made for:

  * Product search results (`/product-search`)
  * Category data (root and subcategories)
  * Basket and wishlist data
  * Product lists (`/product-lists`, including wishlist)
  * Analytics events (`/viewCategory`, `/__Analytics-Start`, `/web/events/...`)

#### Additional Notes:

* Requests go through the **Mobify proxy** unless noted otherwise (e.g., some analytics).
* Both the server and client **reuse SCAPI access tokens** when valid.
* SSR ensures fast, SEO-optimized loading, while client-side hydration enables personalization and interactivity.
