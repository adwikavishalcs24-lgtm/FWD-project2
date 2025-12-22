// Quick fix script - adds onComplete and onClose to all remaining mini-games
const fs = require('fs');

const files = [
    'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames\\present\\TrafficSignalController.jsx',
    'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames\\present\\StockMarketDecisionGame.jsx',
    'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames\\present\\EnergyGridBalancer.jsx',
    'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames\\future\\TimeRiftStabilizer.jsx',
    'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames\\future\\AIDefenseMatrix.jsx',
    'c:\\Users\\Saatvika Reddy\\FWD-project2\\timetravel\\src\\components\\minigames\\future\\FusionReactorControl.jsx'
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');

        // Fix 1: Add onComplete and onClose to component props
        // Matches: export const ComponentName = ({ ... difficulty = "..." }) => {
        content = content.replace(
            /(export const \w+ = \(\{[\s\S]*?difficulty = "[^"]+")(\s*\}\) => \{)/,
            '$1,\n  onComplete,\n  onClose$2'
        );

        // Fix 2: Add onComplete and onClose to MiniGameBase
        // Matches: <MiniGameBase ... difficulty={difficulty} >
        content = content.replace(
            /(difficulty=\{difficulty\})([\s\n]*>)/,
            '$1\n      onComplete={onComplete}\n      onClose={onClose}$2'
        );

        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Updated: ${file.split('\\').pop()}`);
    } catch (err) {
        console.error(`❌ Error updating ${file}:`, err.message);
    }
});

console.log('\n🎉 All files updated!');
