import { Metadata } from 'next'
import { CheckCircle, Mail, Clock, Users, ArrowRight, Star, Shield, Award, Calendar, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import InscriptionConfirmeeClient from './InscriptionConfirmeeClient'

export const metadata: Metadata = {
  title: 'Inscription Confirmée - HelvetiForma',
  description: 'Votre inscription a été confirmée avec succès. Bienvenue chez HelvetiForma !',
}

export default function InscriptionConfirmeePage() {
  return <InscriptionConfirmeeClient />
}
