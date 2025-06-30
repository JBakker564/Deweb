# Supabase Setup Instructies

## Stap 1: Supabase Project Credentials

1. Ga naar [supabase.com](https://supabase.com) en log in
2. Ga naar je project (of maak een nieuwe aan)
3. Ga naar **Settings** → **API**
4. Kopieer je credentials:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIs...`

## Stap 2: Environment Variables

Update `.env.local` met je echte credentials:

```env
VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Stap 3: Database Setup

1. Ga naar je Supabase dashboard
2. Klik op **SQL Editor** in de sidebar
3. Kopieer en plak de inhoud van `supabase-setup.sql`
4. Klik **Run** om de database tabellen aan te maken

## Stap 4: Admin Account Aanmaken

### Optie A: Via Supabase Dashboard (Aanbevolen)
1. Ga naar **Authentication** → **Users** in je Supabase dashboard
2. Klik **Add user**
3. Vul in:
   - **Email**: `admin@lowkeymedia.com` (of je eigen email)
   - **Password**: `filmmaker2025` (of je eigen wachtwoord)
4. Klik **Create user**

### Optie B: Via de Website
1. Start je development server: `npm run dev`
2. Ga naar `/login`
3. Probeer in te loggen met je gewenste admin credentials
4. Als de gebruiker niet bestaat, maak deze aan via de Supabase dashboard

## Stap 5: Testen

1. Start je app: `npm run dev`
2. Ga naar `/login`
3. Log in met je admin credentials
4. Je zou nu toegang moeten hebben tot het dashboard
5. Voeg een YouTube video toe om te testen

## Troubleshooting

### "Invalid URL" Error
- Controleer of je `.env.local` de juiste Supabase URL heeft
- Herstart je development server na het wijzigen van environment variables

### "Invalid API Key" Error
- Controleer of je de **anon public key** gebruikt (niet de service role key)
- Zorg dat de key compleet is gekopieerd

### Login Werkt Niet
- Controleer of de gebruiker bestaat in **Authentication** → **Users**
- Zorg dat het wachtwoord correct is
- Check de browser console voor error messages

### Database Errors
- Zorg dat je de SQL setup hebt uitgevoerd
- Controleer of Row Level Security policies correct zijn ingesteld