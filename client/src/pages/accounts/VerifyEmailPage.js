import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { verifyEmail } from '../../api/api';
import { useParams } from 'react-router-dom';

function VerifyEmailPage() {
    const { token } = useParams();
    const [verificationStatus, setVerificationStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State to track loading status

    useEffect(() => {
        (async () => {
            if (token) {
                setIsLoading(true); // Start loading
                try {
                    await verifyEmail({ token });
                    setVerificationStatus('success');
                } catch (error) {
                    console.error('Verification failed:', error);
                    setVerificationStatus('error');
                } finally {
                    setIsLoading(false); // Stop loading regardless of the outcome
                }
            }
        })();
    }, [token]);

    return (
        <Container style={{ minHeight: '100vh' }}>
            <Card className="mt-3">
                <Card.Body>
                    <h2 className="text-center mb-4">Verify Email</h2>
                    {isLoading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            {verificationStatus === 'success' && (
                                <Alert variant="success">Your email has been successfully verified!</Alert>
                            )}
                            {verificationStatus === 'error' && (
                                <Alert variant="danger">Failed to verify email. Please try again later.</Alert>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default VerifyEmailPage;
