window.DAF_DATA = {
  social: {
    instagram: {
      url: "https://www.instagram.com/daf_taipei/",
      handle: "@daf_taipei",
      label: "Instagram"
    },
    facebook: {
      url: "https://www.facebook.com/DigitalArtFestivalTaipei/?locale=zh_TW",
      name: "臺北數位藝術節",
      label: "Facebook"
    }
  },
  works: Array.from({length: 18}, (_, i) => ({
    id: i + 1, type: "work", number: String(i + 1).padStart(2, "0"), title: `作品名稱${i + 1}`,
    year: "2026", medium: "複合媒材", dimensions: "尺寸待定", location: "臺北植物園",
    description: "作品介紹文字預留。作品透過數位媒材與環境之間的關係，回應「灰色自動體」的策展主題。",
    images: Array.from({length: 4}, (_, imageIndex) => ({
      id: `${i + 1}-${imageIndex + 1}`,
      src: "",
      alt: `作品名稱${i + 1} 圖片 ${imageIndex + 1}`
    })),
    creators: [{name: i % 4 === 0 ? "藝術團隊名稱" : `藝術家${(i % 8) + 1}`, bio: "藝術家／創作團隊介紹文字預留，實際內容將由後台資料提供。"}]
  })),
  mapMarkers: [
    {workId: 1, x: 57, y: 38},
    {workId: 2, x: 45, y: 67},
    {workId: 3, x: 27, y: 31},
    {workId: 4, x: 69, y: 60},
    {workId: 5, x: 39, y: 48}
  ],
  soundArtists: Array.from({length: 4}, (_, i) => ({
    id: 21 + i,
    type: "sound",
    number: String(i + 1).padStart(2, "0"),
    title: `聲響作品／演出名稱${i + 1}`,
    year: "2026",
    medium: "聲響演出",
    dimensions: "",
    location: "臺北植物園",
    description: "聲響作品／演出介紹文字預留。實際內容將由後台資料提供。",
    images: Array.from({length: 4}, (_, imageIndex) => ({
      id: `sound-${i + 1}-${imageIndex + 1}`,
      src: "",
      alt: `聲響作品／演出名稱${i + 1} 圖片 ${imageIndex + 1}`
    })),
    creators: [{
      name: `聲響藝術家${i + 1}`,
      bio: "聲響藝術家／創作團隊介紹文字預留，實際內容將由後台資料提供。"
    }]
  })),
  events: [
    ...Array.from({length: 4}, (_, i) => ({
      id: i + 1, type: "講座", title: `講座 ${String(i + 1).padStart(2, "0")}`,
      date: "日期待定", time: "時間待定", location: "地點待定",
      speaker: "講者待定", instructor: "", description: "活動介紹待定。",
      images: [{id: `event-${i + 1}-1`, src: "", alt: `講座 ${String(i + 1).padStart(2, "0")} 活動紀錄 Placeholder`}]
    })),
    ...Array.from({length: 2}, (_, i) => ({
      id: i + 5, type: "工作坊", title: `工作坊 ${String(i + 1).padStart(2, "0")}`,
      date: "日期待定", time: "時間待定", location: "地點待定",
      speaker: "", instructor: "帶領者待定", description: "活動介紹待定。",
      images: [{id: `event-${i + 5}-1`, src: "", alt: `工作坊 ${String(i + 1).padStart(2, "0")} 活動紀錄 Placeholder`}]
    }))
  ],
  organizations: [
    {type:"主辦單位", names:["臺北市文化局"]}, {type:"協辦單位", names:["文創技研有限公司"]},
    {type:"場地合作", names:["臺北典藏植物園"]}, {type:"合作單位", names:["臺灣當代文化實驗場", "噪流"]},
    {type:"贊助", names:["C2x3", "十銓科技"], sponsor:true}
  ]
};
