const fs = require('fs/promises');
const path = require('path');

async function generateForceOverride() {
    const sourcePath = path.join(__dirname, 'overrides/app');
    const outputFile = '.force_override';
    const targetPrefix = './node_modules/@salesforce/extension-chakra-storefront';
    const transformedPaths = [];

    async function getAllFiles(dirPath) {
        try {
            const files = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    await getAllFiles(fullPath);
                } else {
                    // Get relative path from source directory
                    const relativePath = path.relative(sourcePath, fullPath);
                    // Transform to target path
                    const transformedPath = path.join(targetPrefix, relativePath);
                    // Convert to posix path with forward slashes
                    const normalizedPath = transformedPath.split(path.sep).join('/');
                    transformedPaths.push(normalizedPath);
                }
            }
        } catch (error) {
            console.error('Error reading directory:', error);
        }
    }

    try {
        await getAllFiles(sourcePath);
        // Sort paths for consistent output
        transformedPaths.sort();
        // Write to output file
        await fs.writeFile(outputFile, transformedPaths.join('\n'));
        console.log(`Successfully created ${outputFile}`);
    } catch (error) {
        console.error('Error writing output file:', error);
    }
}

generateForceOverride();