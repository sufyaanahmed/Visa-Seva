import { Resend } from 'resend';
import { notificationTemplates, templateDefinition } from '../platform/email-templates.js';
const resend=new Resend(process.env.RESEND_API_KEY);
for (const template of Object.values(notificationTemplates)) {
  let result=await resend.templates.get(template.alias);
  if(result.error && result.error.name !== 'not_found') {
    // A missing alias returns 404 with a provider-specific name.
    if(result.error.statusCode !== 404 && !/not found/i.test(result.error.message)) throw new Error(result.error.message);
  }
  if(!result.data) result=await resend.templates.create(templateDefinition(template));
  if(result.error) throw new Error(result.error.message);
  const published=await resend.templates.publish(result.data.id);
  if(published.error) throw new Error(published.error.message);
  console.log(`${template.alias}: published`);
  await new Promise(r=>setTimeout(r,600));
}
