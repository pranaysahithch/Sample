import React, { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { API } from './utils/api';
import { Upload, MessageSquare, LayoutDashboard, Network, FileText, Brain, Search, SplitSquareHorizontal } from 'lucide-react';
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import './style.css';

const languages = {
  en: 'English',
  hi: 'हिंदी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  ml: 'മലയാളം',
  kn: 'ಕನ್ನಡ',
};

const askInputHints = {
  en: 'Type your question in the selected language. Answers will be translated back into that language.',
  hi: 'चयनित भाषा में अपना प्रश्न टाइप करें। उत्तर फिर से चुनी हुई भाषा में अनुवादित किया जाएगा।',
  te: 'ఎంచుకున్న భాషలో మీ ప్రశ్నను టైప్ చేయండి. సమాధానాలను తిరిగి ఆ భాషలో అనువదిస్తారు.',
  ta: 'நீங்கள் தேர்ந்தெடுத்த மொழியில் உங்கள் கேள்வியை தட்டச்சு செய்யவும். பதில்கள் மீண்டும் அந்த மொழிக்கு மொழிபெயர்க்கப்படும்.',
  ml: 'തിരഞ്ഞെടുത്ത ഭാഷയിൽ നിങ്ങളുടെ ചോദ്യം ടൈപ്പ് ചെയ്യുക. ഉത്തരം തിരിച്ച് ആ ഭാഷയിലേക്ക് വിവർത്തനം ചെയ്യും.',  kn: 'ನೆಮ್ಮದಿಯಾದ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ. ಉತ್ತರವು ಆ ಭಾಷೆಯಲ್ಲಿ ಅನುವಾದ ಮಾಡಲಾಗುತ್ತದೆ.',};

const translations = {
  en: {
    brand: 'BizKnow AI',
    ask: 'Ask AI',
    upload: 'Upload Docs',
    dashboard: 'Admin Dashboard',
    graph: 'Knowledge Graph',
    logout: 'Logout',
    loginTitle: 'BizKnow AI',
    loginSubtitle: 'Smart Document Knowledge Assistant',
    loginButton: 'Login',
    loginNote: 'Demo: admin/admin or user/user',
    usernamePlaceholder: 'username',
    passwordPlaceholder: 'password',
    uploadHeading: 'Upload Company Documents',
    uploadHint: 'Step 1: Upload the sample PDF from sample-docs/Sample_Company_Policy.pdf. Backend extracts text and splits it into chunks for RAG search.',
    chooseFileError: 'Please choose a PDF, DOCX, TXT, or MD file first.',
    uploadButton: 'Upload & Process',
    selected: 'Selected:',
    successTitle: 'RAG Processing Completed ✅',
    nowAsk: 'Now go to Ask AI and ask: What is the leave policy?',
    askHeading: 'Ask Company Documents',
    askDescription: 'Step 2: Ask after uploading. RAG searches local JSON chunks and returns answer with citations.',
    askPlaceholder: 'Ask about company policy, SOP, PDF...',
    askButton: 'Ask',
    answerTitle: 'AI Answer',
    sourcesTitle: 'Sources',
    howRag: 'How RAG Worked',
    stepQuestion: '1. Question',
    stepTokens: '2. Search Tokens',
    stepRetrieved: '3. Retrieved Chunks',
    noSource: 'No source found',
    noDocuments: 'No documents uploaded yet.',
    documentsLabel: 'Documents',
    chunksLabel: 'Chunks',
    chatsLabel: 'Chats',
    storageLabel: 'No DB',
    graphHint: 'Simple visual relation: App → uploaded documents → generated chunks.',
    translationInfo: 'Website language & answer translation',
    translating: 'Translating answer...',
    translateError: 'Translation failed. See backend logs for details.',
  },
  hi: {
    brand: 'बिज़नॉलेज एआई',
    ask: 'AI से पूछें',
    upload: 'दस्तावेज़ अपलोड करें',
    dashboard: 'व्यवस्थापक डैशबोर्ड',
    graph: 'ज्ञान ग्राफ',
    logout: 'लॉग आउट',
    loginTitle: 'बिज़नॉलेज एआई',
    loginSubtitle: 'स्मार्ट दस्तावेज़ ज्ञान सहायक',
    loginButton: 'लॉगिन',
    loginNote: 'डेमो: admin/admin या user/user',
    usernamePlaceholder: 'यूज़रनेम',
    passwordPlaceholder: 'पासवर्ड',
    uploadHeading: 'कंपनी दस्तावेज़ अपलोड करें',
    uploadHint: 'कदम 1: sample-docs/Sample_Company_Policy.pdf से PDF अपलोड करें। बैकएंड पाठ निकालता है और RAG खोज के लिए चंक्स बनाता है।',
    chooseFileError: 'कृपया पहले PDF, DOCX, TXT, या MD फ़ाइल चुनें।',
    uploadButton: 'अपलोड और प्रक्रिया करें',
    selected: 'चयनित:',
    successTitle: 'RAG प्रोसेसिंग पूरी हुई ✅',
    nowAsk: 'अब Ask AI पर जाएँ और पूछें: What is the leave policy?',
    askHeading: 'कंपनी दस्तावेज़ पूछें',
    askDescription: 'कदम 2: अपलोड करने के बाद पूछें। RAG स्थानीय JSON चंक्स में खोज करती है और स्रोतों के साथ उत्तर लौटाती है।',
    askPlaceholder: 'कंपनी नीति, SOP, PDF के बारे में पूछें...',
    askButton: 'पूछें',
    answerTitle: 'AI उत्तर',
    sourcesTitle: 'स्रोत',
    howRag: 'RAG ने कैसे काम किया',
    stepQuestion: '1. प्रश्न',
    stepTokens: '2. खोज टोकन',
    stepRetrieved: '3. पुनर्प्राप्त चंक्स',
    noSource: 'कोई स्रोत नहीं मिला',
    noDocuments: 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया।',
    documentsLabel: 'दस्तावेज़',
    chunksLabel: 'चंक्स',
    chatsLabel: 'चैट्स',
    storageLabel: 'कोई DB नहीं',
    graphHint: 'सरल दृश्य: एप → अपलोड किए गए दस्तावेज़ → उत्पन्न चंक्स।',
    translationInfo: 'वेबसाइट भाषा और उत्तर अनुवाद',
    translating: 'उत्तर का अनुवाद हो रहा है...',
    translateError: 'अनुवाद विफल हुआ। बैकएंड लॉग देखें।',
  },
  te: {
    brand: 'బిజ్‌నోల్ ఏఐ',
    ask: 'AI ను అడగండి',
    upload: 'డాక్యుమెంట్లు అప్లోడ్ చేయండి',
    dashboard: 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    graph: 'జ్ఞాన గ్రాఫ్',
    logout: 'లాగౌట్',
    loginTitle: 'బిజ్‌నోల్ ఏఐ',
    loginSubtitle: 'స్మార్ట్ డాక్యుమెంట్ నాలెడ్జ్ అసిస్టెంట్',
    loginButton: 'లాగిన్',
    loginNote: 'డెమో: admin/admin లేదా user/user',
    usernamePlaceholder: 'వినియోగదారుని పేరు',
    passwordPlaceholder: 'పాస్వర్డ్',
    uploadHeading: 'కంపెనీ డాక్యుమెంట్లు అప్లోడ్ చేయండి',
    uploadHint: 'దశ 1: sample-docs/Sample_Company_Policy.pdf నుంచి PDF అప్లోడ్ చేయండి. బ్యాక్‌ఎండ్ పాఠ్యాన్ని తీసి RAG శోధన కోసం టుక్కలు (chunks) చేస్తుంది.',
    chooseFileError: 'దయచేసి ముందుగా PDF, DOCX, TXT, లేదా MD ఫైల్ ఎంచుకోండి.',
    uploadButton: 'అప్లోడ్ & ప్రక్రియా',
    selected: 'ఎంచుకున్నది:',
    successTitle: 'RAG ప్రాసెసింగ్ పూర్తి అయింది ✅',
    nowAsk: 'ఇప్పుడే Ask AI కి వెళ్లి అడగండి: What is the leave policy?',
    askHeading: 'కంపెనీ డాక్యుమెంట్లను అడగండి',
    askDescription: 'దశ 2: అప్లోడ్ చేసిన తర్వాత అడగండి. RAG స్థానిక JSON టుక్కలను శోధిస్తుంది మరియు మూలాలతో సమాధానం ఇస్తుంది.',
    askPlaceholder: 'కంపెనీ విధానం, SOP, PDF గురించి అడగండి...',
    askButton: 'అడగండి',
    answerTitle: 'AI సమాధానం',
    sourcesTitle: 'మూలాలు',
    howRag: 'RAG ఎలా పనిచేసింది',
    stepQuestion: '1. ప్రశ్న',
    stepTokens: '2. శోధన టోకన్లు',
    stepRetrieved: '3. తీసుకున్న టుక్కలు',
    noSource: 'మూలం కనబడలేదు',
    noDocuments: 'ఇప్పుడూ ఏ డాక్యుమెంట్ లేదు.',
    documentsLabel: 'డాక్యుమెంట్లు',
    chunksLabel: 'చంకులు',
    chatsLabel: 'చాట్స్',
    storageLabel: 'DB లేదు',
    graphHint: 'సాదారణ దృశ్యం: యాప్ → అప్లోడ్ చేసిన డాక్యుమెంట్లు → సృష్టించిన టుక్కలు.',
    translationInfo: 'వెబ్‌సైట్ భాష & సమాధాన అనువాదం',
    translating: 'సమాధానం అనువదించబడుతోంది...',
    translateError: 'అనువాదం విఫలమైంది. బ్యాక్‌ఎండ్ లాగ్‌లు చూడండి.',
  },
  ta: {
    brand: 'பேஸ்நோல் ஏஐ',
    ask: 'AI ஐ கேளுங்கள்',
    upload: 'ஆவணங்களை பதிவேற்றவும்',
    dashboard: 'அட்மின் டாஷ்போர்டு',
    graph: 'அறிவு வரைபடம்',
    logout: 'வெளியேறு',
    loginTitle: 'பேஸ்நோல் ஏஐ',
    loginSubtitle: 'ஸ்மார்ட் ஆவண அறிவு உதவியாளர்',
    loginButton: 'உள்நுழைவு',
    loginNote: 'டெமோ: admin/admin அல்லது user/user',
    usernamePlaceholder: 'பயனர்பெயர்',
    passwordPlaceholder: 'கடவுச் சொல்',
    uploadHeading: 'நிறுவன ஆவணங்களை பதிவேற்றவும்',
    uploadHint: 'படி 1: sample-docs/Sample_Company_Policy.pdf இலிருந்து PDF ஐ பதிவேற்றவும். பின்புலம் உரையை எடுத்து RAG தேடலுக்கு துண்டுகளை உருவாக்குகிறது.',
    chooseFileError: 'முதலில் PDF, DOCX, TXT, அல்லது MD கோப்பைத் தேர்ந்தெடுக்கவும்.',
    uploadButton: 'பதிவேற்று & செயலாக்கு',
    selected: 'தேர்ந்தெடுத்தது:',
    successTitle: 'RAG செயலாக்கம் முடிந்தது ✅',
    nowAsk: 'இப்போது Ask AIக்கு சென்று கேளுங்கள்: What is the leave policy?',
    askHeading: 'நிறுவன ஆவணங்களை கேளுங்கள்',
    askDescription: 'படி 2: பதிவேற்றிய பின் கேளுங்கள். RAG உள்ளூர் JSON துண்டுகளில் தேடுகிறது மற்றும் மேற்கோள்களுடன் பதில் அளிக்கிறது.',
    askPlaceholder: 'நிறுவன கொள்கை, SOP, PDF பற்றி கேளுங்கள்...',
    askButton: 'கேள்',
    answerTitle: 'AI பதில்',
    sourcesTitle: 'சேரினம்',
    howRag: 'RAG எப்படி வேலை செய்தது',
    stepQuestion: '1. கேள்வி',
    stepTokens: '2. தேடல் டோக்கன்கள்',
    stepRetrieved: '3. மீட்டெடுக்கப்பட்ட துண்டுகள்',
    noSource: 'மூலம் கிடைக்கவில்லை',
    noDocuments: 'இன்னும் எந்த ஆவணமும் இல்லை.',
    documentsLabel: 'ஆவணங்கள்',
    chunksLabel: 'துண்டுகள்',
    chatsLabel: 'சேட்கள்',
    storageLabel: 'ஏதுமில்லை',
    graphHint: 'எளிய காட்சி: செயலி → பதிவேற்றப்பட்ட ஆவணங்கள் → உருவாக்கப்பட்ட துண்டுகள்.',
    translationInfo: 'இணையதளம் மொழியும் பதில் மொழிபெயர்ப்பும்',
    translating: 'பதில் மொழிபெயர்ப்பு செய்யப்படுகிறது...',
    translateError: 'மொழிபெயர்ப்பு தோல்வியடைந்தது. பின்புல பதிவுகளைப் பார்வையிடுங்கள்.',
  },
  ml: {
    brand: 'ബിസ്നോൾ എഐ',
    ask: 'AI ൽ ചോദിക്കുക',
    upload: 'ഡോക്യുമെന്റുകൾ അപ്‌ലോഡ് ചെയ്യുക',
    dashboard: 'അഡ്മിൻ ഡാഷ്ബോർഡ്',
    graph: 'വിദ്യാഭ്യാസ ഗ്രാഫ്',
    logout: 'ലോഗ്ഔട്ട്',
    loginTitle: 'ബിസ്നോൾ എഐ',
    loginSubtitle: 'സ്മാർട്ട് ഡോക്ക്യുമെന്റ് നോളജ് അസിസ്റ്റന്റ്',
    loginButton: 'ലോഗിൻ',
    loginNote: 'ഡെമോ: admin/admin അല്ലെങ്കിൽ user/user',
    usernamePlaceholder: 'ഉപയോക്തൃനാമം',
    passwordPlaceholder: 'പാസ്‌വേർഡ്',
    uploadHeading: 'കമ്പനി ഡോക്യുമെന്റുകൾ അപ്‌ലോഡ് ചെയ്യുക',
    uploadHint: 'പടി 1: sample-docs/Sample_Company_Policy.pdf നിന്ന് PDF അപ്‌ലോഡ് ചെയ്യുക. ബാക്ക്‌എൻഡ് ടെക്സ്റ്റ് പുറത്തെടുക്കുന്നു మరియు RAG തിരക്കുള്ള ചങ്കുകൾ സൃഷ്ടിക്കുന്നു.',
    chooseFileError: 'ദയവായി ആദ്യം PDF, DOCX, TXT, അല്ലെങ്കിൽ MD ഫയൽ തിരഞ്ഞെടുക്കുക.',
    uploadButton: 'അപ്‌ലോഡ് & പ്രോസസ്സ് ചെയ്യുക',
    selected: 'തിരഞ്ഞെടുത്തത്:',
    successTitle: 'RAG പ്രോസസ്സിംഗ് പൂർത്തിയായി ✅',
    nowAsk: 'ഇപ്പോൾ Ask AI ൽ പോകൂ, ചോദിക്കുക: What is the leave policy?',
    askHeading: 'കമ്പനി ഡോക്യുമെന്റുകൾ ചോദിക്കുക',
    askDescription: 'പടി 2: അപ്‌ലോഡ് ചെയ്തതിനു ശേഷം ചോദിക്കുക. RAG ലൊക്കൽ JSON ചങ്കുകളിൽ തിരയുകയും ഉത്തരം നൽകുകയും ചെയ്യുന്നു.',
    askPlaceholder: 'കമ്പനി നയം, SOP, PDF എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
    askButton: 'ചോദിക്കുക',
    answerTitle: 'AI പ്രതികരണം',
    sourcesTitle: 'മൂലങ്ങൾ',
    howRag: 'RAG എങ്ങനെ പ്രവർത്തിച്ചു',
    stepQuestion: '1. ചോദ്യം',
    stepTokens: '2. തിരയൽ ടോക്കനുകൾ',
    stepRetrieved: '3. എടുത്ത ചങ്കുകൾ',
    noSource: 'മൂല്യം കണ്ടെത്തിയില്ല',
    noDocuments: 'ഇന്നുവരെ ഡോക്യുമെന്റ് ഇല്ല.',
    documentsLabel: 'ഡോക്യുമെന്റുകൾ',
    chunksLabel: 'ചങ്കുകൾ',
    chatsLabel: 'ചാറ്റുകൾ',
    storageLabel: 'DB ഇല്ല',
    graphHint: 'സാധാരണ കാഴ്ച: ആപ്പ് → അപ്‌ലോഡ് ചെയ്ത ഡോക്യുമെന്റുകൾ → സൃഷ്ടിച്ച ചങ്കുകൾ.',
    translationInfo: 'വെബ്സൈറ്റ് ഭാഷയും ഉത്തരം വിവർത്തനവും',
    translating: 'പ്രതികരണം വിവർത്തനം ചെയ്യുന്നു...',
    translateError: 'വിവർത്തനം പരാജയപ്പെട്ടു. ബാക്ക്‌എൻഡ് ലോഗുകൾ പരിശോധിക്കുക.',
  },
  kn: {
    brand: 'ಬಿಜಕ್ನೋ ಎಐ',
    ask: 'ಪ್ರಶ್ನೆ ಕೇಳು',
    upload: 'ಡಾಕ್ಯುಮೆಂಟ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
    dashboard: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    graph: 'ಜ್ಞಾನ ಗ್ರಾಫ್',
    logout: 'ಲಾಗ್‌ಔಟ್ ಮಾಡಿ',
    login: 'ಲಾಗ್ ಇನ್ ಮಾಡಿ',
    username: 'ಬಳಕೆದಾರಹೆಸರು',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    usernamePlaceholder: 'ನಿಮ್ಮ ಬಳಕೆದಾರಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    passwordPlaceholder: 'ಪಾಸ್‌ವರ್ಡ್',
    uploadHeading: 'ಕಂಪನಿ ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ',
    uploadHint: 'ಹಂತ 1: sample-docs/Sample_Company_Policy.pdf ನಿಂದ PDF ಅಪ್ಲೋಡ್ ಮಾಡಿ. ಬ್ಯಾಕೆಂಡ್ ಪಠ್ಯ ಹೊರತೆಗೆಯುತ್ತದೆ ಮತ್ತು RAG ಸಂಗ್ರಹಗಳನ್ನು ರಚಿಸುತ್ತದೆ.',
    chooseFileError: 'ದಯವಿಟ್ಟು ಮೊದಲು PDF, DOCX, TXT, ಅಥವಾ MD ಫೈಲನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.',
    uploadButton: 'ಅಪ್ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಪ್ರಕ್ರಿಯೆ ಮಾಡಿ',
    selected: 'ಆಯ್ಕೆಯಾದ:',
    successTitle: 'RAG ಪ್ರಕ್ರಿಯೆ ಪೂರ್ಣವಾಯಿತು ✅',
    nowAsk: 'ಈಗ Ask AI ಗೆ ಹೋಗಿ, ಕೇಳಿ: What is the leave policy?',
    askHeading: 'ಕಂಪನಿ ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳನ್ನು ಪ್ರಶ್ನೆ ಮಾಡಿ',
    askDescription: 'ಹಂತ 2: ಅಪ್ಲೋಡ್ ಮಾಡಿದ ನಂತರ ಕೇಳಿ. RAG ಸ್ಥಳೀಯ JSON ಸಂಗ್ರಹಗಳನ್ನು ಹುಡುಕುತ್ತದೆ ಮತ್ತು ಉತ್ತರ ನೀಡುತ್ತದೆ.',
    askPlaceholder: 'ಕಂಪನಿ ನೀತಿ, SOP, PDF ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಮಾಡಿ...',
    askButton: 'ಪ್ರಶ್ನೆ ಮಾಡಿ',
    answerTitle: 'AI ಪ್ರತಿಕ್ರಿಯೆ',
    sourcesTitle: 'ಮೂಲಗಳು',
    howRag: 'RAG ಹೇಗೆ ಕೆಲಸ ಮಾಡಿದೆ',
    stepQuestion: '1. ಪ್ರಶ್ನೆ',
    stepTokens: '2. ಹುಡುಕು ಟೋಕನ್‌ಗಳು',
    stepRetrieved: '3. ಮರುಪಡೆಯಲಾದ ಸಂಗ್ರಹಗಳು',
    noSource: 'ಮೂಲವು ಕಂಡುಬಂದಿಲ್ಲ',
    noDocuments: 'ಇಲ್ಲೇ ಯಾವುದೇ ಡಾಕ್ಯುಮೆಂಟ್ ಇಲ್ಲ.',
    documentsLabel: 'ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳು',
    chunksLabel: 'ಸಂಗ್ರಹಗಳು',
    chatsLabel: 'ಚ್ಯಾಟ್‌ಗಳು',
    storageLabel: 'DB ನಾಲ್ಕೋ',
    graphHint: 'ಸಾಮಾನ್ಯ ವೀಕ್ಷಣೆ: ಅ್ಯಪ್ → ಅಪ್ಲೋಡ್ ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳು → ರಚಿಸಿದ ಸಂಗ್ರಹಗಳು.',
    translationInfo: 'ವೆಬ್‌ಸೈಟ್ ಭಾಷೆ ಮತ್ತು ಉತ್ತರ ಅನುವಾದ',
    translating: 'ಪ್ರತಿಕ್ರಿಯೆ ಅನುವಾದ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    translateError: 'ಅನುವಾದ ವಿಫಲವಾಯಿತು. ಬ್ಯಾಕೆಂಡ್ ಲಾಗ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
  },
};


function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('bizknowUser') || 'null'));
  const [page, setPage] = useState('ask');
  const [lang, setLang] = useState('en');
  const t = translations[lang] || translations.en;

  if (!user) return <Login onLogin={setUser} t={t} />;

  return <>
    <nav>
      <div className="brand"><Brain /> {t.brand}</div>
      <button onClick={() => setPage('ask')}>{t.ask}</button>
      <button onClick={() => setPage('upload')}>{t.upload}</button>
      <button onClick={() => setPage('dashboard')}>{t.dashboard}</button>
      <button onClick={() => setPage('graph')}>{t.graph}</button>
      <span>{user.name} ({user.role})</span>
      <div className="lang-select">
        <label>{t.translationInfo}: </label>
        <select value={lang} onChange={e => setLang(e.target.value)}>
          {Object.entries(languages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>
      <button onClick={() => { localStorage.removeItem('bizknowUser'); setUser(null); }}>{t.logout}</button>
    </nav>
    <main>{page === 'ask' && <Ask t={t} lang={lang} />}{page === 'upload' && <UploadDocs t={t} />}{page === 'dashboard' && <Dashboard t={t} />}{page === 'graph' && <Graph t={t} />}</main>
  </>;
}

function Login({ onLogin, t }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const r = await API.post('/login', { username, password });
      localStorage.setItem('bizknowUser', JSON.stringify(r.data));
      onLogin(r.data);
    } catch {
      setErr('Login failed. Use admin/admin or user/user');
    }
  }

  return <div className="login"><div className="card"><h1>{t.loginTitle}</h1><p>{t.loginSubtitle}</p><form onSubmit={submit}><input value={username} onChange={e => setUsername(e.target.value)} placeholder={t.usernamePlaceholder} /><input value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} type="password" /><button>{t.loginButton}</button></form><small>{t.loginNote}</small><p className="error">{err}</p></div></div>;
}

function UploadDocs({ t }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function upload() {
    if (!file) { setErr(t.chooseFileError); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(r.data);
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'Upload failed. Check backend terminal.');
    } finally {
      setLoading(false);
    }
  }

  return <section>
    <h1><Upload /> {t.uploadHeading}</h1>
    <p>{t.uploadHint}</p>
    <div className="card">
      <input type="file" accept=".pdf,.docx,.txt,.md" onChange={e => setFile(e.target.files[0])} />
      <button onClick={upload} disabled={loading}>{loading ? 'Processing...' : t.uploadButton}</button>
      {file && <p><b>{t.selected}</b> {file.name}</p>}
      {err && <p className="error">{err}</p>}
    </div>
    {result && <div className="card success"><h2>{t.successTitle}</h2><p><b>Document:</b> {result.document.fileName}</p><p><b>Characters extracted:</b> {result.document.totalChars}</p><p><b>Chunks created:</b> {result.document.totalChunks}</p><p>{t.nowAsk}</p><h3>Chunk Preview</h3>{result.chunksPreview.map(c => <pre key={c.id}>{`Chunk ${c.chunkIndex} | words ${c.wordStart}-${c.wordEnd}
${c.text}`}</pre>)}</div>}
  </section>;
}

function Ask({ t, lang }) {
  const [q, setQ] = useState('What is the leave policy?');
  const [ans, setAns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [translatedAnswer, setTranslatedAnswer] = useState(null);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateError, setTranslateError] = useState('');

  const askHint = askInputHints[lang] || askInputHints.en;

  async function translateAnswer(text) {
    if (!text || lang === 'en') return;
    setTranslateLoading(true);
    setTranslateError('');
    try {
      const r = await API.post('/translate', { text, language: lang });
      setTranslatedAnswer(r.data.text);
    } catch (e) {
      setTranslateError(e.response?.data?.message || t.translateError);
    } finally {
      setTranslateLoading(false);
    }
  }

  async function translateQuestionToEnglish(text) {
    if (!text || lang === 'en') return text;
    try {
      const r = await API.post('/translate', { text, language: 'English' });
      return r.data.text;
    } catch (e) {
      throw new Error(e.response?.data?.message || 'Question translation failed.');
    }
  }

  async function ask() {
    setLoading(true); setErr(''); setAns(null); setTranslatedAnswer(null); setTranslateError('');
    try {
      const questionToAsk = lang === 'en' ? q : await translateQuestionToEnglish(q);
      const r = await API.post('/ask', { question: questionToAsk, originalQuestion: q });
      setAns(r.data);
      if (lang !== 'en') {
        await translateAnswer(r.data.answer);
      }
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'Ask failed. Check backend terminal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ans?.answer && lang !== 'en') {
      translateAnswer(ans.answer);
    } else {
      setTranslatedAnswer(null);
    }
  }, [lang]);

  return <section>
    <h1><MessageSquare /> {t.askHeading}</h1>
    <p>{t.askDescription}</p>
    <p className="hint">{askHint}</p>
    <div className="askbox"><input value={q} onChange={e => setQ(e.target.value)} placeholder={t.askPlaceholder} /><button onClick={ask} disabled={loading}>{loading ? 'Thinking...' : t.askButton}</button></div>
    {err && <p className="error">{err}</p>}
    {ans && <div className="grid"><div className="card answer"><h2>{t.answerTitle}</h2><pre>{translatedAnswer || ans.answer}</pre><h3>{t.sourcesTitle}</h3>{ans.sources.length ? ans.sources.map(s => <span className="tag" key={s}>{s}</span>) : <p>{t.noSource}</p>}{translateLoading && <p>{t.translating}</p>}{translateError && <p className="error">{translateError}</p>}</div><div className="card"><h2>{t.howRag}</h2><Step icon={<FileText />} title={t.stepQuestion} text={ans.originalQuestion || ans.question} /><Step icon={<Search />} title={t.stepTokens} text={ans.ragSteps.questionTokens.join(', ')} /><Step icon={<SplitSquareHorizontal />} title={t.stepRetrieved} text={`${ans.ragSteps.retrievedChunks} chunks selected from local JSON storage`} />{ans.ragSteps.chunks.map(c => <pre key={c.id}>{`Score: ${c.score.toFixed(3)} | ${c.fileName} | chunk ${c.chunkIndex}
${c.text}`}</pre>)}</div></div>}
  </section>;
}

function Dashboard({ t }) {
  const [stats, setStats] = useState(null);
  const [docs, setDocs] = useState([]);
  const [chats, setChats] = useState([]);
  useEffect(() => { API.get('/stats').then(r => setStats(r.data)); API.get('/documents').then(r => setDocs(r.data)); API.get('/chats').then(r => setChats(r.data)); }, []);
  return <section><h1><LayoutDashboard /> {t.dashboard}</h1>{stats && <div className="stats"><div>{stats.documents}<small>{t.documentsLabel}</small></div><div>{stats.chunks}<small>{t.chunksLabel}</small></div><div>{stats.chats}<small>{t.chatsLabel}</small></div><div>{t.storageLabel}<small>{stats.storage}</small></div></div>}<div className="grid"><div className="card"><h2>{t.uploadHeading}</h2>{docs.length ? docs.map(d => <p key={d.id}>📄 {d.fileName} - {d.totalChunks} chunks</p>) : <p>{t.noDocuments}</p>}</div><div className="card"><h2>{t.loginNote}</h2>{chats.slice().reverse().map(c => <p key={c.id}><b>Q:</b> {c.question}</p>)}</div></div></section>;
}

function Graph({ t }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    API.get('/graph').then(r => {
      setGraphData(r.data);
      const flowNodes = r.data.nodes.map((n, i) => ({
        id: n.id,
        data: { label: <span className={`node-${n.type}`}>{n.id}</span> },
        position: {
          x: i === 0 ? 250 : i % 2 === 0 ? 0 : 500,
          y: (Math.floor(i / 2) * 150) + 50
        },
        style: {
          background: n.type === 'app' ? '#ff6b35' : n.type === 'document' ? '#ffc300' : '#1f2a3a',
          color: '#fff8e7',
          border: '2px solid #ff6b35',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '13px',
          fontWeight: 'bold'
        }
      }));
      
      const flowEdges = r.data.edges.map(e => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ff6b35' },
        animated: true,
        style: { stroke: '#ff6b35', strokeWidth: 2 }
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    });
  }, []);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
      <h1><Network /> {t.graph}</h1>
      <p>{t.graphHint}</p>
      <div style={{ flex: 1, border: '1px solid #2a3347', borderRadius: '12px', marginTop: '15px', overflow: 'hidden' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
          <Background color="#d4af8e" gap={16} size={1} style={{ opacity: 0.2 }} />
          <Controls />
          <MiniMap nodeColor={n => n.style?.background} maskColor="rgba(255, 107, 53, 0.1)" />
        </ReactFlow>
      </div>
    </section>
  );
}

function Step({ icon, title, text }) { return <div className="step"><span>{icon}</span><div><b>{title}</b><p>{text}</p></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
