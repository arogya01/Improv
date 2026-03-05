export type TopicCategory =
  | "objects"
  | "situations"
  | "relationships"
  | "professions"
  | "emotions"
  | "constraints";

export type RouletteTopic = {
  id: string;
  text: string;
  category: TopicCategory;
  tags: string[];
};
