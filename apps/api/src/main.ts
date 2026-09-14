import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.controller';
import { appointmentRouter } from './modules/appointments/appointment.controller';
import { doctorRouter } from './modules/doctors/doctor.controller';
import { profileRouter } from './modules/profiles/profile.controller';
import { adminRouter } from './modules/admin/admin.controller';

const app = express();
app.use(helmet());
app.use(compression()); // low-bandwidth support: always compress responses
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/profiles', profileRouter);
app.use('/api/v1/admin', adminRouter);

app.use(errorHandler);
app.listen(env.port, () => console.log(`TeleCare API on :${env.port}`));
