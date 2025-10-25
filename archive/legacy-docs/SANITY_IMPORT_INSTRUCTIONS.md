# Import Concept Page to Sanity CMS

The concept page has been updated to use Sanity CMS for content management. Follow these steps to import the content:

## Prerequisites

You need a Sanity API token with write permissions.

### Get Your API Token:

1. Visit https://www.sanity.io/manage
2. Select your project (xzzyyelh)
3. Go to "API" → "Tokens"
4. Create a new token with "Editor" or "Admin" permissions
5. Copy the token (you won't be able to see it again!)

## Option 1: Import via Script (Recommended)

1. Create a `.env.local` file in the `sanity` directory if it doesn't exist:

```bash
cd /Users/damien/Documents/Oksan/helvetiforma_combine/helvetiforma_v3/sanity
touch .env.local
```

2. Add your Sanity token to `.env.local`:

```env
SANITY_API_TOKEN=your_token_here
NEXT_PUBLIC_SANITY_PROJECT_ID=xzzyyelh
NEXT_PUBLIC_SANITY_DATASET=production
```

3. Install dependencies (if not already installed):

```bash
npm install @sanity/client tsx
```

4. Run the import script:

```bash
npx tsx scripts/import-concept-page.ts
```

## Option 2: Manual Entry via Sanity Studio

1. Start Sanity Studio:

```bash
cd /Users/damien/Documents/Oksan/helvetiforma_combine/helvetiforma_v3/sanity
npm run dev
```

2. Open Sanity Studio in your browser (usually http://localhost:3333)

3. Create a new "Page" document with:
   - Title: "Notre Concept - HelvetiForma"
   - Slug: "concept"
   - Add Hero Section with title and subtitle
   - Add sections:
     - Feature Cards Section (Les Piliers de Notre Méthode)
     - List Section (Notre Approche Blended Learning)

## Option 3: Using Sanity CLI

```bash
cd /Users/damien/Documents/Oksan/helvetiforma_combine/helvetiforma_v3/sanity

# Create the document
npx sanity documents create \
  --dataset production \
  --replace \
  < scripts/concept-page.json
```

## Verify the Import

After importing, visit http://localhost:3000/concept to see the page with Sanity CMS content.

## Edit Content

Your client can now edit the concept page content by:

1. Going to Sanity Studio
2. Finding "Pages" in the left menu
3. Clicking on "Notre Concept - HelvetiForma"
4. Editing any text, adding/removing sections, changing images, etc.
5. Publishing changes

All changes will be instantly reflected on your website!

## Supported Section Types

The concept page supports three types of sections:

1. **Feature Cards Section**: Grid of cards with icons (great for benefits, features)
2. **List Section with Icons**: Two-column layout with icon list (great for step-by-step processes)
3. **Rich Text Section**: Free-form content with formatting (great for detailed explanations)

Your client can mix and match these section types to create the perfect layout!

