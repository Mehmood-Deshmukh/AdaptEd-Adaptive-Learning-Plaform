const fs = require('fs');

const getUniqueProjects = async () => {
    try{
        const projects = JSON.parse(fs.readFileSync('../codedex_projects.json', 'utf8'));
        const titleMap = {};
        const uniqueProjects = projects.filter(project => {
        if (titleMap[project.title]) {
            return false;
        } else {
            titleMap[project.title] = true;
            return true;
        }
        });
        console.log(uniqueProjects);

        fs.writeFileSync('../unique_projects.json', JSON.stringify(uniqueProjects, null, 2));

        console.log(`${uniqueProjects.length} unique projects found`);
    }
    catch(err){
        console.error(err);
    }
}

getUniqueProjects();