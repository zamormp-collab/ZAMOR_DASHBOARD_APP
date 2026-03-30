const request = require('supertest');
const app = require('../src/server');

describe('DevOps Dashboard - HTML Page', () => {
  
  describe('GET /', () => {
    it('should return dashboard HTML page with 200 status', async () => {
      const res = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);
      
      expect(res.text).toContain('DevOps Dashboard');
    });

    it('should contain deployment status section', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.text).toContain('Deployment Status');
      expect(res.text).toContain('Production');
      expect(res.text).toContain('Staging');
    });

    it('should contain build history table', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.text).toContain('CI/CD Pipeline');
      expect(res.text).toContain('Build');
    });

    it('should have proper HTML structure', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.text).toContain('<!DOCTYPE html>');
      expect(res.text).toContain('<meta charset="UTF-8">');
    });

    it('should reference Bootstrap CSS framework', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.text).toContain('bootstrap');
    });
  });

  describe('GET /css/style.css', () => {
    it('should serve custom CSS file', async () => {
      const res = await request(app)
        .get('/css/style.css')
        .expect(200)
        .expect('Content-Type', /css/);
      
      expect(res.text).toContain('font-family');
    });
  });
});
