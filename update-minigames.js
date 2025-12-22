const fs = require('fs');
const path = require('path');

const minigamesDir = 'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames';

const gameFiles = [
    'past/AncientClockmakerAlignment.jsx',
    'past/SteamEnginePressureControl.jsx',
    'past/TelegraphMorseDecoder.jsx',
    'present/TrafficSignalController.jsx',
    'present/StockMarketDecisionGame.jsx',
    'present/EnergyGridBalancer.jsx',
    'future/TimeRiftStabilizer.jsx',
    'future/AIDefenseMatrix.jsx',
    'future/FusionReactorControl.jsx'
];

gameFiles.forEach(file => {
    const filePath = path.join(minigamesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add onComplete and onClose to component props
    content = content.replace(
        /(export const \w+ = \(\{[^}]+)(}\) => \{)/,
        '$1,\n  onComplete,\n  onClose\n$2'
    );

    // Add onComplete and onClose to MiniGameBase
    content = content.replace(
        /(<MiniGameBase[\s\S]*?)(>[\s\S]*?{renderForge|{render|children)/,
        (match, p1, p2) => {
            if (!p1.includes('onComplete=')) {
                return p1 + '\n      onComplete={onComplete}\n      onClose={onClose}\n    ' + p2;
            }
            return match;
        }
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
});

console.log('All files updated!');
