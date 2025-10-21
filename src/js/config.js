// --- Global Variables & Constants ---

const DEFAULT_PINNED_SITES = [
  { id: 1, name: "Google", url: "https://google.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=www.google.com" },
  { id: 2, name: "YouTube", url: "https://youtube.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=youtube.com" },
  { id: 3, name: "Wikipedia", url: "https://wikipedia.org", favicon: "https://www.google.com/s2/favicons?sz=128&domain=en.wikipedia.org" },
  { id: 4, name: "Gmail", url: "https://mail.google.com", favicon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
  { id: 5, name: "GitHub", url: "https://github.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=www.github.com" },
];

const SEARCH_ENGINES = {
  google: { name: "Google", url: "https://www.google.com/search?q=", icon: "./src/icons/google.png" },
  bing: { name: "Bing", url: "https://www.bing.com/search?q=", icon: "./src/icons/bing.png" },
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", icon: "./src/icons/duckduckgo.png" },
  wikipedia: { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search=", icon: "./src/icons/wikipedia.png" },
  brave: { name: "Brave", url: "https://search.brave.com/search?q=", icon: "./src/icons/brave.png" },
  yandex: { name: "Yandex", url: "https://yandex.com/search/?text=", icon: "./src/icons/yandex.png" },
  startpage: { name: "Startpage", url: "https://www.startpage.com/sp/search?query=", icon: "./src/icons/startpage.png" },
  ecosia: { name: "Ecosia", url: "https://www.ecosia.org/search?q=", icon: "./src/icons/ecosia.png" },
  baidu: { name: "Baidu", url: "https://www.baidu.com/s?wd=", icon: "./src/icons/baidu.png" },
};