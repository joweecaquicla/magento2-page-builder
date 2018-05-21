<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
declare(strict_types=1);

namespace Magento\PageBuilder\Controller\Adminhtml\GoogleMaps;

use Magento\Framework\Controller\ResultFactory;

class ValidateApi extends \Magento\Backend\App\Action
{
    const ADMIN_RESOURCE = 'Magento_Backend::content';

    /**
     * @var \Magento\PageBuilder\Model\GoogleMaps\ApiKeyValidator
     */
    private $apiKeyValidator;

    /**
     * Constructor
     *
     * @param \Magento\Backend\App\Action\Context $context
     * @param \Magento\PageBuilder\Model\GoogleMaps\ApiKeyValidator $apiKeyValidator
     */
    public function __construct(
        \Magento\Backend\App\Action\Context $context,
        \Magento\PageBuilder\Model\GoogleMaps\ApiKeyValidator $apiKeyValidator
    ) {
        parent::__construct($context);
        $this->ApiKeyValidator = $apiKeyValidator;
    }

    /**
     * Send test request to Google Maps and return response
     *
     * @return Json
     */
    public function execute()
    {
        $apiKey = $this->getRequest()->getParam('key');
        return $this->resultFactory->create(ResultFactory::TYPE_JSON)->setData($this->ApiKeyValidator->validate($apiKey));
    }
}
