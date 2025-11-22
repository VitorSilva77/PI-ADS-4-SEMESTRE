const courseRepository = require('../repositories/courseRepository'); 
const auditService = require('./auditService');
const { getCurrentUser } = require('./authService');
const { checkRole } = require('../utils/security');
const { ROLES } = require('../utils/constants');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage(); 
const bucketName = process.env.GCLOUD_STORAGE_BUCKET;

async function uploadImageToGCS(imageObj) {
  if (!bucketName) throw new Error('Bucket GCS não configurado no .env');
  
  const bucket = storage.bucket(bucketName);
  const fileName = `${Date.now()}-${imageObj.name.replace(/\s+/g, '_')}`;
  const file = bucket.file(fileName);

  const buffer = Buffer.from(imageObj.buffer);

  await file.save(buffer, {
    contentType: imageObj.type,
    resumable: false,
  });

  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

async function getAllCourses() {
  return courseRepository.findAll();
}

async function createCourse(courseData) {
  const user = getCurrentUser();
  if (!user) throw new Error('Não autenticado.');

  checkRole(user.role_name, [ROLES.TI, ROLES.RH]);

  if (!courseData.titulo) throw new Error('O título do curso é obrigatório.');

  let imagem_path = null; 

  if (courseData.image) {
    try {
        imagem_path = await uploadImageToGCS(courseData.image);
    } catch (error) {
        console.error('Erro no upload da imagem:', error);
        throw new Error('Falha ao fazer upload da imagem do curso.');
    }
  }

  const dbCourseData = {
    titulo: courseData.titulo,
    descricao: courseData.descricao,
    carga_horaria: courseData.carga_horaria,
    professor_id: courseData.professor_id,
    imagem_path: imagem_path 
  };

  const newCourse = await courseRepository.create(dbCourseData);

  await auditService.log(user.id, 'CREATE_COURSE', 'cursos', newCourse.id, { titulo: newCourse.titulo });
  
  return newCourse;
}

async function updateCourse(courseId, courseData) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }

  checkRole(user.role_name, [ROLES.TI, ROLES.RH]);

  if (!courseId) {
    throw new Error('ID do curso é obrigatório.');
  }

  if (!courseData.titulo) {
    throw new Error('O título do curso é obrigatório.');
  }

  const updatedRows = await courseRepository.update(courseId, courseData);

  if (updatedRows === 0) {
    throw new Error('Curso não encontrado ou nenhum dado para atualizar.');
  }

  await auditService.log(user.id, 'UPDATE_COURSE', 'cursos', courseId, { ...courseData });
  
  return { id: courseId, ...courseData };
}

async function findCoursesByProfessor(professorId) {
    if (!professorId) {
      throw new Error('ID do professor é obrigatório.');
    }
    return courseRepository.findByProfessorId(professorId);
}

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  findCoursesByProfessor,
  uploadImageToGCS
};
