import type { RouletteTopic, TopicCategory } from "./types";

type TopicCatalog = Record<TopicCategory, readonly string[]>;

const TOPIC_CATALOG: TopicCatalog = {
  objects: [
    "Wrangled Earphones",
    "A Wobbly Office Chair",
    "A Half-Read Novel",
    "A Broken Umbrella",
    "A Smartwatch with 2% Battery",
    "A Mystery Key",
    "A Cracked Coffee Mug",
    "A Sticky Note with a Number",
    "A Deflated Birthday Balloon",
    "A Fancy Pen That Won't Write",
    "A Grocery Receipt from Last Year",
    "A Rain-Soaked Backpack",
    "A Single Roller Skate",
    "A Misplaced Wedding Ring Box",
    "A Tiny House Plant",
    "An Overpacked Suitcase",
    "A Vintage Camera",
    "A Bent Metro Card",
    "A Karaoke Microphone",
    "A Board Game Missing One Piece"
  ],
  situations: [
    "You are ten minutes late to your own farewell party",
    "The elevator stops between floors",
    "You accidentally join the wrong video call",
    "A surprise inspection starts in five minutes",
    "Your flight is boarding, but your passport is gone",
    "You are stuck in line behind your ex",
    "A neighbor mistakes you for a celebrity",
    "You promised to babysit and forgot",
    "A fire drill interrupts a marriage proposal",
    "Your food order arrives at the wrong table",
    "You are asked to host without preparation",
    "A live mic catches your private comment",
    "A blackout hits during game night",
    "You discover two people using your name",
    "The hotel loses your reservation",
    "You have to give directions in a city you don't know",
    "A street performance asks for volunteers",
    "You and a stranger claim the same taxi",
    "Your alarm fails on exam day",
    "The meeting room is double-booked"
  ],
  relationships: [
    "Two siblings competing for one inheritance",
    "Best friends opening a business together",
    "A mentor disappointed in their favorite student",
    "Roommates negotiating a quiet-hour treaty",
    "A parent and teen switching roles for a day",
    "Coworkers hiding a shared secret",
    "Neighbors in a passive-aggressive parking war",
    "A coach and player after a hard loss",
    "An older cousin and younger cousin at odds",
    "A bride and maid of honor disagreeing",
    "Former bandmates reunited for one night",
    "A landlord and tenant renegotiating rent",
    "A teacher and parent in conflict",
    "A longtime customer and new shop owner",
    "A detective and their reluctant informant",
    "A wedding planner and indecisive couple",
    "A chef and food critic face-to-face",
    "A startup founder and skeptical investor",
    "A doctor and patient with opposite priorities",
    "Two friends fighting over who gets the dog"
  ],
  professions: [
    "Wedding Photographer",
    "Night Shift Radio Host",
    "Theme Park Safety Inspector",
    "Airport Lost-and-Found Manager",
    "Luxury Real Estate Agent",
    "Cruise Ship Entertainer",
    "Antique Appraiser",
    "Tattoo Artist",
    "Public Defender",
    "Wildlife Rehabilitator",
    "Museum Curator",
    "Voiceover Actor",
    "Disaster Relief Coordinator",
    "Subway Announcer",
    "Political Speechwriter",
    "Food Truck Owner",
    "Court Stenographer",
    "Meteorologist",
    "Personal Shopper",
    "Urban Beekeeper"
  ],
  emotions: [
    "Excited but trying to stay cool",
    "Deeply embarrassed in public",
    "Relieved after a close call",
    "Quietly jealous",
    "Furious but forced to be polite",
    "Guilty and overcompensating",
    "Nostalgic at the wrong time",
    "Confident until challenged",
    "Anxious and overprepared",
    "Overjoyed but pretending it's normal",
    "Heartbroken and hiding it",
    "Suspicious of everyone",
    "Hopeful after repeated failure",
    "Bored and creating chaos",
    "Protective of someone vulnerable",
    "Proud but emotionally unavailable",
    "Lonely in a crowded room",
    "Irritated by minor noises",
    "Optimistic against all evidence",
    "Calm during an obvious crisis"
  ],
  constraints: [
    "You must whisper the whole scene",
    "Every sentence starts with \"Honestly\"",
    "You cannot use the letter E",
    "You can only ask questions",
    "You have to speak in headlines",
    "You are not allowed to sit down",
    "Every third line must rhyme",
    "You must keep one hand behind your back",
    "You may only respond in three words",
    "You can only communicate with metaphors",
    "You are trying not to laugh",
    "You must pretend the floor is lava",
    "You can only talk while walking",
    "You have to end each line with \"right now\"",
    "You cannot say \"I\" or \"me\"",
    "You must alternate between fast and slow speech",
    "You only have 20 seconds to convince",
    "You must imitate a movie trailer voice",
    "You cannot repeat any noun",
    "You have to narrate your own actions"
  ]
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function makeTopic(category: TopicCategory, text: string, index: number): RouletteTopic {
  const categoryTag = category.slice(0, -1);
  return {
    id: `${categoryTag}-${String(index + 1).padStart(3, "0")}-${slugify(text)}`,
    text,
    category,
    tags: [categoryTag, "improv", "roulette"]
  };
}

export const TOPIC_DECK: readonly RouletteTopic[] = Object.entries(TOPIC_CATALOG).flatMap(
  ([category, topics]) => topics.map((text, index) => makeTopic(category as TopicCategory, text, index))
);

export const TOPIC_DECK_VERSION = "v1";
