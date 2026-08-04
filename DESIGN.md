# UI/UX Design Specification: Barbershop Booking App (Monochrome Theme)

**Design System Directives**
*   **Color Palette:** Strictly Black, White, and Grayscale. No primary or secondary accent colors (no reds, blues, etc.).
*   **Backgrounds:** Pure white (`#FFFFFF`) or very light gray (`#F9F9F9`) for app backgrounds.
*   **Typography:** Primary text is solid black (`#000000`). Secondary text/labels are dark gray (`#555555`).
*   **Primary Actions (Buttons):** Solid black background (`#000000`) with pure white text (`#FFFFFF`).
*   **Secondary Actions (Buttons):** Transparent or pure white background with a black or dark gray border (`#CCCCCC`) and black text.
*   **Active/Selected States:** Indicated by solid black fills with white text.
*   **Inactive/Disabled States:** Indicated by light gray text (`#AAAAAA`) and transparent or light gray backgrounds (`#EFEFEF`).
*   **Images/Illustrations:** All photos and vector illustrations must be rendered in high-contrast grayscale.

---

## Screen 1: Landing Page
**Layout & Visuals:**
*   **Background:** Full-screen grayscale photograph of a male model. The image should have a dark gradient overlay at the bottom to ensure text readability.
*   **Header (Top):** 
    *   Left: App Logo in strict black and white.
    *   Right: A square hamburger menu button with a black border, white background, and black lines.
*   **Typography (Bottom-Left Aligned):**
    *   "Welcome to" in white, regular weight.
    *   "HAIRNERDS STUDIO" in white, bold, large heading font.
    *   "Your journey to self-discovery starts here." in white, small subtext.
*   **Call to Action (Bottom):**
    *   A full-width (with margins) primary button. Solid black background, white text ("Book Now"), featuring a white arrow pointing top-right.

---

## Screen 2 - 5: Service Category Selection
**Global Elements (Present on all subsequent screens):**
*   **Top Navigation Bar:** White background. Black and white logo on the left. A "Visit Membership" button (white background, black border, black text) and a grayscale user avatar on the right.
*   **Floating Timer:** Fixed to the top right. Dark gray/black background (`#333333`) with white text (e.g., "Timer 4:37").

**Layout & Visuals:**
*   **Navigation:** A circular "Back" button (white background, black border, black left-arrow icon).
*   **Header Text:** "Choose Service" (Black, Bold), with subtitle "Which service would you prefer?" (Dark Gray).
*   **Main Carousel Card:** 
    *   A large card displaying a grayscale illustration of the service (e.g., Haircut, Perm, Color). 
    *   Below the illustration: Service Name in bold black, description in dark gray, and starting price in bold black.
*   **List View ("Available Services"):**
    *   A vertical list of sub-services.
    *   Each item is a card with a white background, light gray border, and rounded corners.
    *   Left side: A circular grayscale icon/thumbnail.
    *   Right side: Service name (black, bold) and duration (dark gray).

---

## Screen 6: Service Details Modal (Bottom Sheet)
**Layout & Visuals:**
*   **Backdrop:** The background screen is dimmed with a semi-transparent black overlay (`rgba(0,0,0,0.5)`).
*   **Bottom Sheet Container:** White background, rounded top corners, snapping to the bottom of the screen.
*   **Header:** Service Name (e.g., "Men's Haircut") in bold black. Subtitle showing duration and price in dark gray.
*   **Hero Image:** Grayscale illustration of the service spanning the width of the modal with a black border.
*   **Text Content:** "SERVICE INFO" heading (black, bold) followed by a paragraph of description (dark gray).
*   **Icon Grid ("WHAT YOU'LL GET"):**
    *   A 2-column or wrapping flex layout of features (Consultation, Hair Cut, Hair Wash, etc.).
    *   Icons must be solid black or outlined black. Text is dark gray.
*   **Action Buttons (Sticky Bottom):**
    *   Primary Button: "Choose Service" (Solid black background, white text).
    *   Secondary Button: "Close" (White background, light gray border, black text).

---

## Screen 7: Hair Artist Selection
**Layout & Visuals:**
*   **Header:** "Available Hair Artists" (Black, Bold) and subtitle (Dark Gray).
*   **Search & Filter:**
    *   Search input field with a white background, light gray border, black text, and a black magnifying glass icon.
    *   "Sort by:" text followed by pill-shaped filter chips. 
    *   Active chip ("Default"): Solid black background, white text.
    *   Inactive chips ("A-Z", "Highest Rating"): White background, gray border, black text.
*   **Artist Cards (Vertical Scroll):**
    *   Background: Grayscale illustration with a dark overlay to make text pop.
    *   Right side: Grayscale cutout photograph of the barber.
    *   Top left: Rating badge (white background, black star, black text) and Price badge (white background, black text).
    *   Bottom left: Barber's name (white, bold) and a "View Profile" button (black background, white text).
    *   Top right: A circular selection radio button. When selected, it fills with solid black.
*   **Action Button (Fixed Bottom):** Primary button labeled "Next" (Solid black, white text).

---

## Screen 8: Date Selection
**Layout & Visuals:**
*   **Header:** "Pick Schedule with [Barber Name]" (Black, Bold).
*   **Month Selector:** Centered month and year (black text) with black left/right chevron arrows.
*   **Calendar Grid:**
    *   Days of the week (Su, Mo, Tu, etc.) in dark gray.
    *   Available dates: Black text.
    *   Unavailable dates ("Leave"): Light gray text, surrounded by a light gray outline circle.
    *   Selected date: Solid black circular background with pure white text.
*   **Warning Text:** "Please select the booking date & time." displayed in dark gray or black italics (do not use red).
*   **Action Buttons (Fixed Bottom):**
    *   Primary: "Checkout" (Solid black, white text).
    *   Secondary: "Cancel" (White background, gray border, black text).

---

## Screen 9: Time Slot Selection
**Layout & Visuals:**
*   **Continuation from Screen 8:** The calendar remains visible at the top.
*   **Time Slot Grid:**
    *   Header: "Choose Time" (Black, bold) and "Service Duration: 1h" (Dark gray).
    *   A grid of pill-shaped buttons for available times (e.g., 10:00, 11:00).
    *   Unselected slot: White background, light gray border, black text.
    *   Selected slot: Solid black background, white text.
*   **Action Buttons (Fixed Bottom):**
    *   Primary: "Checkout" (Solid black, white text).
    *   Secondary: "Cancel" (White background, gray border, black text).

---

## Screen 10: Booking Confirmation
**Layout & Visuals:**
*   **Header:** "BOOKING CONFIRMATION" in bold black, centered.
*   **Summary Card:**
    *   A large white card container with rounded corners and a very subtle light gray shadow.
    *   Data Rows: Use a flexbox "space-between" layout. Left side label (e.g., "Date", "Time", "Name") in dark gray. Right side value (e.g., "06 Agu 2026", "10:00") in bold black.
    *   Include a black outline copy-to-clipboard icon next to the Phone Number.
*   **Service Summary Box:**
    *   Nested inside the main card at the bottom, separated by a light gray divider line.
    *   Grayscale circular thumbnail of the service on the left.
    *   Service name (black) and duration (gray) in the center.
    *   Price (bold black) on the right.
*   **Footer Note:** "*The listed price is only the base price..." in small dark gray text.
*   **Action Button (Fixed Bottom):** Primary button labeled "Confirm Booking" (Solid black background, white text).