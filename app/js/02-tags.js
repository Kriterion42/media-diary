// Модуль 02-tags. Теги: создание, назначение, бейджи.
"use strict";
function tagById(id) { return S.tags.find(t => t.id === id); }
function itemTags(id) { return (S.itemTags[id] || []).map(tagById).filter(Boolean); }
function toggleItemTag(id, tagId) {
  const arr = S.itemTags[id] = S.itemTags[id] || [];
  const i = arr.indexOf(tagId);
  if (i >= 0) arr.splice(i, 1); else arr.push(tagId);
  save();
}
function createTag(name, color, shape) {
  const id = "t" + Date.now().toString(36);
  S.tags.push({id, name: name.trim(), color, shape: shape || "round"}); save();
  return id;
}
function deleteTag(tagId) {
  S.tags = S.tags.filter(t => t.id !== tagId);
  for (const id in S.itemTags) S.itemTags[id] = (S.itemTags[id] || []).filter(x => x !== tagId);
  save();
}
function tagChipHTML(t, small) {
  const r = {round: "99px", square: "6px", diamond: "2px", flag: "99px 4px 4px 99px"}[tagShape()] || "99px";
  return `<span class="tagchip${small ? " sm" : ""}" style="background:${t.color};border-radius:${r}">${esc(t.name)}</span>`;
}
function itemTagsHTML(id, small) {
  return itemTags(id).map(t => tagChipHTML(t, small)).join("");
}
