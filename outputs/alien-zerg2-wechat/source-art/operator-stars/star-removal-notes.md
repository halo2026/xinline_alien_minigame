# 去除肖像内星标

使用内置image_gen，原始输入assets/operator-stars.jpg（0048版本）。生成结果star-removal-generated.png，原始22张PNG与manifest保留。tools/build-operator-stars.py完成原始图集打包后调用remove-operator-stars.cjs，只从生成图中取每格左上星标区域修补。运行图集assets/operator-stars.jpg，同步wolf；2112×576不变。生成图上下白边不进入游戏；裁剪为(0,69,2079,581)规范化后提取补片。

Prompt:
Use case: precise-object-edit. Edit target: the supplied existing game portrait sprite atlas, 11 equal columns and 2 equal rows (22 portraits). Remove ONLY all small GOLD STAR rating icons at the TOP LEFT of EACH of the 22 portrait tiles, in both rows. Inpaint each tiny removed star region with the matching dark sci-fi background/frame behind it. Absolutely preserve the 11-column 2-row grid, tile alignment, original wide aspect ratio, every character's exact face, hair/head silhouette, weapons, clothes, pose, composition, colors, and borders. Do not crop or scale or rearrange tiles. Do not add any text, star symbols, badges or icons. No stars anywhere. This is a surgical icon removal from a production atlas, not a redesign. Output at 2112x576 if possible.
