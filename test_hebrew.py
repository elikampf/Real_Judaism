import json

# Recreate the Hebrew episodes file without BOM
data = {
    "episodes": [
        {
            "title": "פרק א: עזוב את המהפכה, תתחיל בצעד אחד",
            "description": "מה אם הפחד מהשינוי גדול יותר מהשינוי עצמו? חודש אלול מגיע, ואיתו הרצון להתקרב והלחץ לעשות \"חשבון נפש\". רבים מאיתנו מכירים את התחושה המשתקת הזו: אנחנו יודעים שעלינו להשתנות, אבל הר המשימות נראה גבוה מדי, והפחד להסתכל פנימה בכנות פשוט משתק אותנו. בפרק זה, הרב ארי קלפר חושף פרספקטיבה משחררת שמפרקת את מעגל הייאוש. הוא מראה כיצד חכמת התורה לא דורשת מאיתנו מהפכה של רגע, אלא מזמינה אותנו למסע שמתחיל בצעד אחד, קטן ואפשרי, שהופך את כל התמונה. דרך ניתוח המנגנון הפסיכולוגי של הפחד ודוגמאות מהחיים המודרניים – מההתמודדות עם הסמארטפון ועד נרמול המאבק בשמירת העיניים – הרב קלפר מציע אסטרטגיה מעשית ופורצת דרך. במקום להתמקד ביעד הסופי והמפטיד, נלמד לזהות את הפעולה הקטנה ביותר שאנו כן יכולים לעשות היום, ולהבין שבעיני הקב\"ה, עצם ההתחלה וההשתדלות הן העיקר. תגלו כיצד להניח את הטלפון לחמש דקות יכול להיות מעשה רוחני גדול יותר מלהחליט החלטות גדולות שלעולם לא נקיים. בסיום הפרק תצאו עם תחושת הקלה והעצמה. תבינו שהכוח לשנות לא נמצא בפסגת ההר, אלא בנכונות שלכם לעשות את הצעד הראשון והצנוע ביותר. אתם מסוגלים להתחיל, לא מחר, אלא עכשיו, בפעולה זעירה שתניע תהליך של צמיחה אמיתית. מוכנים להפוך את הפחד לכוח המניע שלכם? בהנחיית הרב ארי קלפר ובהפקת אלי פודקאסט הפקות, פרק זה הוא חלק מסדרת \"יהדות אמיתית\", הזמינה ב-RealJudaism.org. אל תשכחו להירשם ולשתף כדי להישאר מחוברים לשיעורים היומיים ולתובנות התורה הנצחיות שלנו",
            "date": "04-09-25",
            "length": "00:27:40",
            "spotify_embed_url": "https://open.spotify.com/embed/episode/6M0N1AceP8lsegtJVKRIou",
            "series": "shmiras-einayim-hebrew",
            "episode_number": 1,
            "file_path": "data\\shmiras-einayim-hebrew_episodes.csv"
        }
    ]
}

# Write the file without BOM
with open('data/shmiras-einayim-hebrew_episodes.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('✅ Hebrew episodes JSON recreated successfully without BOM')

# Now test it
try:
    with open('data/shmiras-einayim-hebrew_episodes.json', 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    print('✅ Hebrew episodes JSON is valid')
    print(f'📊 Found {len(test_data["episodes"])} episodes')
    if test_data['episodes']:
        episode = test_data['episodes'][0]
        print(f'🎧 First episode: {episode["title"][:50]}...')
        print(f'📅 Date: {episode["date"]}')
        print(f'⏱️ Duration: {episode["length"]}')
        print(f'🔗 Has Spotify embed: {"Yes" if episode.get("spotify_embed_url") else "No"}')
except Exception as e:
    print(f'❌ Error: {e}')
