// --- Global Variables & Constants ---

const DEFAULT_PINNED_SITES = [
    { id: 1, name: "Google", url: "https://google.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=www.google.com" },
    { id: 2, name: "YouTube", url: "https://youtube.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=youtube.com" },
    { id: 3, name: "Wikipedia", url: "https://wikipedia.org", favicon: "https://www.google.com/s2/favicons?sz=128&domain=en.wikipedia.org" },
    { id: 4, name: "Gmail", url: "https://mail.google.com", favicon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
    { id: 5, name: "GitHub", url: "https://github.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=www.github.com" },
];

const SEARCH_ENGINES = {
    google: {
        name: "Google",
        url: "https://www.google.com/search?q=",
        icon: "./src/icons/google.png",
        suggestionUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q={query}&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    bing: {
        name: "Bing",
        url: "https://www.bing.com/search?q=",
        icon: "./src/icons/bing.png",
        suggestionUrl: "https://api.bing.com/osjson.aspx?query={query}&JsonType=callback&JsonCallback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    duckduckgo: {
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q=",
        icon: "./src/icons/duckduckgo.png",
        suggestionUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q={query}&callback={callback}",
        //suggestionUrl: "https://ac.duckduckgo.com/ac/?q={query}&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    wikipedia: {
        name: "Wikipedia",
        url: "https://en.wikipedia.org/w/index.php?search=",
        icon: "./src/icons/wikipedia.png",
        suggestionUrl: "https://en.wikipedia.org/w/api.php?action=opensearch&search={query}&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    brave: {
        name: "Brave",
        url: "https://search.brave.com/search?q=",
        icon: "./src/icons/brave.png",
        suggestionUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q={query}&callback={callback}",
        //suggestionUrl: "https://search.brave.com/api/suggest?q={query}&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    yandex: {
        name: "Yandex",
        url: "https://yandex.com/search/?text=",
        icon: "./src/icons/yandex.png",
        suggestionUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q={query}&callback={callback}",
        //suggestionUrl: "https://yandex.com/suggest/suggest-ya.cgi?v=4&part={query}&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    startpage: {
        name: "Startpage",
        url: "https://www.startpage.com/sp/search?query=",
        icon: "./src/icons/startpage.png",
        // Uses Google for suggestions 
        suggestionUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q={query}&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    ecosia: {
        name: "Ecosia",
        url: "https://www.ecosia.org/search?q=",
        icon: "./src/icons/ecosia.png",
        suggestionUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q={query}&callback={callback}",
        //suggestionUrl: "https://ac.ecosia.org/autocomplete?q={query}&type=list&callback={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data[1] || []
    },
    baidu: {
        name: "Baidu",
        url: "https://www.baidu.com/s?wd=",
        icon: "./src/icons/baidu.png",
        suggestionUrl: "https://suggestion.baidu.com/su?wd={query}&cb={callback}",
        suggestionType: "jsonp",
        suggestionParser: (data) => data.s || []
    },
};

const GOOGLE_APPS = [
    { id: "account", name: "Account", url: "https://myaccount.google.com/", icon: "./src/icons/apps/account.png" },
    { id: "search", name: "Search", url: "https://google.com/", icon: "./src/icons/apps/google.png" },
    { id: "youtube", name: "YouTube", url: "https://www.youtube.com/", icon: "./src/icons/apps/youtube.png" },
    { id: "gmail", name: "Gmail", url: "https://mail.google.com/", icon: "./src/icons/apps/gmail.png" },
    { id: "music", name: "YT Music", url: "https://music.youtube.com/", icon: "./src/icons/apps/music.png" },
    { id: "keep", name: "Keep", url: "https://keep.google.com/", icon: "./src/icons/apps/keep.png" },
    { id: "drive", name: "Drive", url: "https://drive.google.com/", icon: "./src/icons/apps/drive.png" },
    { id: "photos", name: "Photos", url: "https://photos.google.com/", icon: "./src/icons/apps/photos.png" },
    { id: "translate", name: "Translate", url: "https://translate.google.com/", icon: "./src/icons/apps/translate.png" },
    { id: "calendar", name: "Calendar", url: "https://calendar.google.com/", icon: "./src/icons/apps/calendar.png" },
    { id: "meet", name: "Meet", url: "https://meet.google.com/", icon: "./src/icons/apps/meet.png" },
    { id: "contacts", name: "Contacts", url: "https://contacts.google.com/", icon: "./src/icons/apps/contacts.png" },
    { id: "docs", name: "Docs", url: "https://docs.google.com/document/", icon: "./src/icons/apps/docs.png" },
    { id: "sheets", name: "Sheets", url: "https://docs.google.com/spreadsheets/", icon: "./src/icons/apps/sheets.png" },
    { id: "slides", name: "Slides", url: "https://docs.google.com/presentation/", icon: "./src/icons/apps/slides.png" },
];