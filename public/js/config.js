// global variables

var global = {
  highlight_animation_duration: 500,
  top_n_weighted_positive_liwc: 3,
  top_n_weighted_negative_liwc: 3,
  word_trait_corr_type: {
    positive: 'positive',
    negative: 'negative'
  },
  color_schema_old: {
    emotion_tone: '#f46d43',
    angry: '#d7191c',
    sadness: '#f4b46d',
    anxiety: '#f46d43',
    negative_emotions: '#f46d43',
    positive_emotions: '#66bd63',
    writing_tone: '#3690c0',
    causation: '#023858',
    analytical: '#023858',
    tentative: '#0570b0',
    insight: '#3690c0',
    certainty: '#a6bddb',
    confident: '#a6bddb',
    social_tone: '#df65b0',
    family_c: '#980043',
    conscientious: '#980043',
    friends: '#ce1256',
    openness: '#ce1256',
    leisure: '#d4b9da',
    agreeable: '#d4b9da',
    refs_to_others: '#df65b0',
    distant: '#df65b0'
  },
  color_schema: {
    emotion_tone: '#e71d32',
    anger: '#ad1625',
    sadness: '#f4b46d',
    anxiety: '#e71d32',
    negative: '#e71d32',
    cheerfulness: '#df65b0',
    writing_tone: '#5596e6',
    causation: '#5596e6',
    analytical: '#5596e6',
    tentative: '#325c80',
    insight: '#023858',
    certainty: '#9855d4',
    confident: '#9855d4',
    social_tone: '#5aa700',
    family_c: '#2d660a',
    conscientiousness_big5: '#2d660a',
    friends: '#5aa700',
    openness_big5: '#5aa700',
    leisure: '#008571',
    agreeableness_big5: '#008571',
    refs_to_others: '#006d2c',
    distant: '#006d2c'
  },
  sample_text: {
    before: 'Hi Team, \n\nI know the times are difficult! Our sales have been disappointing for the past three quarters for our data analytics product suite. We have a competitive data analytics product suite in the industry. But we need to do our job selling it! \n\nWe need to acknowledge and fix our sales challenges. We can’t blame the economy for our lack of execution! We are missing critical sales opportunities. Our product  is in no way inferior to the competitor products. Our clients are hungry for analytical tools to improve their business outcomes. Economy has nothing to do with it. In fact, it is in times such as this, our clients want to get the insights they need to turn their businesses around. Let’s buckle up and execute. \n\nIn summary, we have a competitive product, and a hungry market. We have to do our job to close the deals.\n\nJennifer Baker\nSales Leader, North-East Geo,\nData Analytics Inc.',
    after: 'Hi Team, \n\nI’m so excited to get onboard as the sales leader for North-east geo. We have a strong data analytics product suite that is among the best in the industry. Last week, I had a chance to sit down with the development team and do a deep-dive of the product suite capabilities. I’m very impressed with what it can do for our clients and the depth and breadth of analytics that the engineering team has incorporated into it. We need to do our job now! \n\nIt’s time for us to invest in learning the product suite capabilities in depth, and work with marketing in shaping the message and take it to our clients aggressively. I know our competition is no where close to us. In fact, I come from one of those and I can attest that our product suite is superior in many aspects. Our clients are hungry for analytical tools to improve their business outcomes. Economy has nothing to do with it. In fact, it is in times like this, our clients want to get the insights they need to turn their businesses around. Let’s buckle up and execute this quarter. Watch out for the training sessions that we’re rolling out jointly with development teams in the coming couple of weeks to give us all an opportunity to learn our capabilities better so that we can represent them better in front of our clients.\n\n In summary, we have a strong product, and a hungry market and I know that you excel in that combination. Let’s go make it happen in the marketplace! \n\nJennifer Baker\nSales Leader, North-East Geo,\nData Analytics Inc.'
  }
};


