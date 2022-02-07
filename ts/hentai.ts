import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import BooruJS, { BooruMappings, Post } from 'boorujs';

const choices = [];
for (const k in BooruMappings) {
  if (Object.prototype.hasOwnProperty.call(BooruMappings, k)) {
    choices.push(k);
  }
}

console.log(choices);
const getOptions = (op: SlashCommandStringOption) => {
  op = op
    .setName('booru')
    .setDescription('Which booru to use (default=gelbooru)');
  for (const k in choices) {
    if (Object.prototype.hasOwnProperty.call(choices, k)) {
      const v = choices[k];
      // @ts-ignore
      op = op.addChoice(v, v);
    }
  }
  return op;
};

let cached: Record<string, Post[]> = {};
type a<b> = (array: b[]) => b[];
const shuffleArray: a<any> = (arr: any[]) => {
  return arr.sort(() => Math.random() - 0.5);
};
const shufflePosts: a<Post> = shuffleArray;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('hentai')
    .setDescription('Uses a booru to send hentai')
    .addStringOption(op =>
      op.setName('query').setDescription('Search Query').setRequired(false),
    )
    .addStringOption(op => getOptions(op)),
  async execute(interaction: CommandInteraction) {
    const Booru = new BooruJS(
      // @ts-ignore
      interaction.options.getString('booru', false) || 'gelbooru',
    );

    await interaction.reply({
      ephemeral: false,
      content: `Loading posts from query \`${
        interaction.options.getString('query') || 'no query'
      }\`...`,
    });
    const q = interaction.options.getString('query') || '';
    if (!cached[q]) cached[q] = await Booru.Posts(q, 10);
    for (let index = 0; index < 3; index++) {
      const posts = shufflePosts(cached[q]);
      let m = '';
      for (let i = 0; i < Math.min(posts.length, 3); i++) {
        const element: Post = posts[i];
        m += element.URL + ' (' + element.id + ')\n';
      }
      await interaction.followUp({
        content: m,
        ephemeral: false,
      });
    }
  },
};
