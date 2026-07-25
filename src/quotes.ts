export interface Quote {
  quote: string;
  author: string;
}

export const curatedQuotes: Quote[] = [
  { quote: "The strongest choice requires the hardest will.", author: "Thanos" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { quote: "Disciplined execution is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { quote: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { quote: "You do not rise to the level of your goals, you fall to the level of your systems.", author: "James Clear" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { quote: "Continuous effort - not strength or intelligence - is the key to unlocking our potential.", author: "Winston Churchill" },
  { quote: "Energy flows where attention goes.", author: "Tony Robbins" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "Hard work beats talent when talent fails to work hard.", author: "Tim Notke" },
  { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { quote: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "Motivation gets you going, but habit gets you through.", author: "Jim Ryun" },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { quote: "Mastering others is strength. Mastering yourself is true power.", author: "Lao Tzu" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" }
];

export const getDailyQuote = (): Quote => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % curatedQuotes.length;
  return curatedQuotes[index];
};

export const fetchNewQuote = async (): Promise<Quote> => {
  try {
    const response = await fetch('https://dummyjson.com/quotes/random', { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      if (data && data.quote && data.author) {
        return { quote: data.quote, author: data.author };
      }
    }
  } catch (err) {
    console.warn('Quote API offline or blocked, switching to curated quote engine:', err);
  }

  // Fallback to random item from curatedQuotes
  const randomIndex = Math.floor(Math.random() * curatedQuotes.length);
  return curatedQuotes[randomIndex];
};
