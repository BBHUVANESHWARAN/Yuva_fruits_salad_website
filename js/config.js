/* =====================================================================
   YUVA FRUITS SALAD — SETTINGS FILE
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to change the website.
   - Text goes inside quotes: "like this"
   - Prices are plain numbers in rupees: 60   (no ₹ sign, no quotes)
   - Leave a value as "" (empty quotes) if you don't have it yet.
     Buttons and lines that need it will stay hidden until you add it.
   - After editing on GitHub, click "Commit changes". The live site
     updates in about a minute.
   ===================================================================== */

window.YUVA_CONFIG = {

  /* ---------- 1. Business details ---------- */
  business: {
    name: "Yuva Fruits Salad",
    tagline: "Fresh fruit, cut the moment you order.",

    // WhatsApp number with country code, digits only. Example: "919876543210"
    whatsapp: "",
    // Phone number for the "Call us" button. Example: "+91 98765 43210"
    phone: "",

    // Shop address, one line per item
    addressLines: [],          // Example: ["12, Gandhi Road", "Near Bus Stand"]
    city: "",                  // Example: "Coimbatore"
    // Opening hours, one line per item
    hours: [],                 // Example: ["Mon–Sat: 7:00 am – 9:30 pm", "Sun: 8:00 am – 2:00 pm"]

    // What to search on Google Maps to find the shop. Example: "Yuva Fruits Salad, Gandhi Road, Coimbatore"
    mapsQuery: "",
    // Link to your Google reviews (from Google Business Profile → "Ask for reviews" / "Share review form")
    googleReviewsUrl: "",

    upiId: "",                 // Example: "yuvafruits@okaxis"
    paymentMethods: ["UPI (GPay, PhonePe, Paytm)", "Cash"],

    // Online links. Leave "" to hide the button.
    instagram: "",             // Example: "https://instagram.com/yuvafruits"
    swiggy: "",
    zomato: "",

    fssai: "",                 // FSSAI licence number, shown in the footer

    // Live website address (used for sharing and Google). Change if you add a custom domain.
    siteUrl: "https://bbhuvaneshwaran.github.io/Yuva_fruits_salad_website/"
  },

  /* ---------- 2. Offer strip (top of the page) ---------- */
  offer: {
    show: true,
    todaysSpecial: "Today's special: mango & pomegranate bowl",
    firstOrderCode: "YUVA10",
    firstOrderText: "10% off your first order"
  },

  /* ---------- 3. Menu ----------
     Tags you can use: "Bestseller", "Low calorie", "High protein",
                       "Kids favourite", "Seasonal"
     Each item can have one or more sizes, each with its own price.
     Keep every "id" unique and without spaces.                       */
  menu: [
    {
      id: "classic", label: "Classic",
      items: [
        {
          id: "mixed-fruit", name: "Mixed fruit bowl",
          description: "Apple, banana, papaya, watermelon and grapes. A little of everything.",
          tags: ["Bestseller"],
          sizes: [{ label: "Small 250 g", price: 60 }, { label: "Medium 400 g", price: 90 }, { label: "Large 600 g", price: 130 }]
        },
        {
          id: "seasonal-bowl", name: "Seasonal fruit bowl",
          description: "Whatever is best at the market this morning. Ask us what's in today.",
          tags: ["Seasonal"],
          sizes: [{ label: "Small 250 g", price: 70 }, { label: "Medium 400 g", price: 100 }]
        },
        {
          id: "papaya-pineapple", name: "Papaya & pineapple bowl",
          description: "Soft papaya with sweet-tangy pineapple. Easy on the stomach.",
          tags: ["Low calorie"],
          sizes: [{ label: "Small 250 g", price: 60 }, { label: "Medium 400 g", price: 90 }]
        }
      ]
    },
    {
      id: "special", label: "Special",
      items: [
        {
          id: "fruit-chaat", name: "Masala fruit chaat",
          description: "Mixed fruit tossed with chaat masala, black salt and a squeeze of lemon.",
          tags: ["Bestseller"],
          sizes: [{ label: "Regular", price: 70 }, { label: "Large", price: 110 }]
        },
        {
          id: "fruit-cream", name: "Fruit & fresh cream bowl",
          description: "Chilled fruit folded into fresh cream with a drizzle of honey.",
          tags: [],
          sizes: [{ label: "Regular", price: 100 }, { label: "Large", price: 150 }]
        },
        {
          id: "honey-nut", name: "Honey, nuts & pomegranate bowl",
          description: "Apple, pomegranate and banana with honey, almonds and cashews.",
          tags: [],
          sizes: [{ label: "Regular", price: 120 }]
        }
      ]
    },
    {
      id: "fitness", label: "Fitness",
      items: [
        {
          id: "protein-bowl", name: "Protein power bowl",
          description: "Banana, apple and pomegranate with sprouts, peanuts and chia seeds.",
          tags: ["High protein"],
          sizes: [{ label: "Regular", price: 110 }, { label: "Large", price: 150 }]
        },
        {
          id: "detox-bowl", name: "Light detox bowl",
          description: "Watermelon, papaya, cucumber and mint with lemon. No sugar added.",
          tags: ["Low calorie"],
          sizes: [{ label: "Regular", price: 90 }]
        },
        {
          id: "pre-workout", name: "Pre-workout bowl",
          description: "Banana, dates and apple with a spoon of peanut butter.",
          tags: ["High protein"],
          sizes: [{ label: "Regular", price: 100 }]
        }
      ]
    },
    {
      id: "kids", label: "Kids",
      items: [
        {
          id: "rainbow-bowl", name: "Rainbow bowl",
          description: "Small colourful cubes of mango, grapes, papaya and kiwi. Easy for small hands.",
          tags: ["Kids favourite"],
          sizes: [{ label: "Kids 200 g", price: 60 }]
        },
        {
          id: "choco-banana", name: "Choco-banana bowl",
          description: "Banana and apple with a light chocolate drizzle and sprinkles.",
          tags: ["Kids favourite"],
          sizes: [{ label: "Kids 200 g", price: 70 }]
        }
      ]
    },
    {
      id: "juices", label: "Fresh juices",
      items: [
        {
          id: "watermelon-juice", name: "Watermelon juice",
          description: "Pressed fresh, no water, no sugar unless you ask.",
          tags: ["Low calorie"],
          sizes: [{ label: "300 ml", price: 50 }, { label: "500 ml", price: 80 }]
        },
        {
          id: "mosambi-juice", name: "Mosambi (sweet lime) juice",
          description: "Freshly squeezed sweet lime.",
          tags: [],
          sizes: [{ label: "300 ml", price: 60 }, { label: "500 ml", price: 90 }]
        },
        {
          id: "pomegranate-juice", name: "Pomegranate juice",
          description: "Only pomegranate. Nothing added.",
          tags: [],
          sizes: [{ label: "300 ml", price: 90 }, { label: "500 ml", price: 140 }]
        },
        {
          id: "abc-juice", name: "ABC juice",
          description: "Apple, beetroot and carrot.",
          tags: ["Seasonal"],
          sizes: [{ label: "300 ml", price: 80 }]
        }
      ]
    }
  ],

  /* ---------- 4. Build your own bowl ---------- */
  builder: {
    sizes: [
      { id: "small",  label: "Small",  weight: "250 g", price: 60,  maxFruits: 3 },
      { id: "medium", label: "Medium", weight: "400 g", price: 90,  maxFruits: 5 },
      { id: "large",  label: "Large",  weight: "600 g", price: 130, maxFruits: 7 }
    ],
    // extra: added to the bowl price when this fruit is picked (0 = free)
    fruits: [
      { id: "apple",       label: "Apple",        extra: 0 },
      { id: "banana",      label: "Banana",       extra: 0 },
      { id: "papaya",      label: "Papaya",       extra: 0 },
      { id: "watermelon",  label: "Watermelon",   extra: 0 },
      { id: "muskmelon",   label: "Muskmelon",    extra: 0 },
      { id: "guava",       label: "Guava",        extra: 0 },
      { id: "grapes",      label: "Grapes",       extra: 10 },
      { id: "pineapple",   label: "Pineapple",    extra: 10 },
      { id: "pomegranate", label: "Pomegranate",  extra: 15 },
      { id: "mango",       label: "Mango (in season)", extra: 15 },
      { id: "kiwi",        label: "Kiwi",         extra: 25 },
      { id: "dragonfruit", label: "Dragon fruit", extra: 30 }
    ],
    toppings: [
      { id: "chaat",   label: "Chaat masala",     extra: 0 },
      { id: "lemon",   label: "Lemon & mint",     extra: 0 },
      { id: "honey",   label: "Honey",            extra: 10 },
      { id: "chia",    label: "Chia seeds",       extra: 15 },
      { id: "cream",   label: "Fresh cream",      extra: 20 },
      { id: "granola", label: "Granola",          extra: 20 },
      { id: "nuts",    label: "Almonds & cashews", extra: 25 }
    ]
  },

  /* ---------- 5. Daily plans (subscriptions) ---------- */
  plans: {
    // Normal price of one medium bowl, used to show how much a plan saves
    regularBowlPrice: 90,
    bowlDescription: "One medium bowl (400 g) a day, fruit changes daily",
    timeSlots: ["7:00 – 9:00 am", "11:00 am – 1:00 pm", "4:00 – 6:00 pm"],
    options: [
      { id: "plan-7",  days: 7,  pricePerDay: 80, note: "Try it for a week" },
      { id: "plan-15", days: 15, pricePerDay: 75, note: "Most popular", highlight: true },
      { id: "plan-30", days: 30, pricePerDay: 70, note: "Best value" }
    ]
  },

  /* ---------- 6. Party and office orders ---------- */
  party: {
    minPeople: 10,
    eventTypes: ["Birthday party", "Office meeting", "Wedding or function", "School or college event", "Gym or sports event", "Other"]
  }
};
