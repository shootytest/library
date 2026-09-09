export const images = {
    house1: "house1.webp",
    house1a: "house1a.webp",
    mansion: "mansion.webp",
    news1a: "news1a.png",
    news1b: "news1b.png",
    news1c: "news1c.png",
    news2a: "news2a.png",
    news2b: "news2b.png",
    news2c: "news2c.png",
    news3a: "news3a.png",
    news3b: "news3b.png",
    news3c: "news3c.png",
    news3d: "news3d.png",
    arvind1: "arvind1.webp",
    arvind2: "arvind2.webp",
    arvind3: "arvind3.webp",
    arvind4: "arvind4.webp",
    sparkle1: "sparkle1.webp",
    sparkle2: "sparkle2.webp",
    sparkle3: "sparkle3.webp",
    sparkle4: "sparkle4.webp",
    sparkle5: "sparkle5.webp",
    sparkle6: "sparkle6.webp",
    sparkle7: "sparkle7.webp",
};

for (const i in images) {
    const o = new Image();
    o.src = images[i];
    images[i] = o;
}

export const levels = [
    { // level 0

    },
    { // level 1
        npcs: [
            {
                name: "npc 1",
                dialogue: "I'm looking for a language professor, but I think I'm at the wrong address...",
                x: 110,
                y: 91,
                w: 27,
                h: 54,
            },
            {
                name: "npc 2",
                dialogue: "I send a lot of letters to my family back in Germany, but I only have time to write them after midnight!",
                x: 570,
                y: 91,
                w: 27,
                h: 54,
            },
        ],
        houses: [
            {
                sprite: "house1",
                x: -110,
                y: 19,
                w: 200,
                h: 200,
                ans: 1,
            },
            {
                sprite: "mansion",
                x: 210,
                y: -42,
                w: 320,
                h: 320,
                ans: 2,
            },
            {
                sprite: "house1a",
                x: 510,
                y: 19,
                w: 200,
                h: 200,
                ans: 0,
            },
        ],
        papers: [
            {
                image: "news1a",
                headline: "Arvind spotted without green tea",
                text: "on the green line",
                x: -200,
            },
            {
                image: "news1b",
                x: 0,
            },
            {
                image: "news1c",
                x: 500,
            },
        ],
        boxes: [
            {
                x: 0,
                y: 140,
                w: 10000,
                h: 45,
                c: "coral",
            },
            {
                x: -150,
                y: 53,
                w: 10,
                h: 5,
                c: "transparent",
            },
        ],
    },
];